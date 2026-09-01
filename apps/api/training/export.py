from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
import onnx
import onnxruntime as ort
import torch
from torch import nn


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def export_and_verify_onnx(
    model: nn.Module,
    output_path: Path,
    verification_sequences: np.ndarray,
    class_count: int,
    metadata: dict[str, object],
) -> dict[str, object]:
    if verification_sequences.ndim != 3 or verification_sequences.shape[1:] != (30, 225):
        raise ValueError("ONNX verification sequences must have shape [samples, 30, 225].")
    if verification_sequences.shape[0] == 0:
        raise ValueError("ONNX verification requires at least one sample.")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    model.cpu().eval()
    dummy = torch.zeros(1, 30, 225, dtype=torch.float32)
    torch.onnx.export(
        model,
        dummy,
        output_path,
        input_names=["landmarks"],
        output_names=["logits"],
        dynamic_axes={"landmarks": {0: "batch"}, "logits": {0: "batch"}},
        opset_version=17,
        dynamo=False,
    )

    onnx_model = onnx.load(str(output_path))
    onnx.checker.check_model(onnx_model)
    session = ort.InferenceSession(str(output_path), providers=["CPUExecutionProvider"])
    batch = verification_sequences[: min(16, verification_sequences.shape[0])].astype(np.float32)
    with torch.inference_mode():
        torch_logits = model(torch.from_numpy(batch)).numpy()
    onnx_logits = np.asarray(session.run(["logits"], {"landmarks": batch})[0], dtype=np.float32)
    if onnx_logits.shape != (batch.shape[0], class_count):
        raise RuntimeError("Exported ONNX model returned an unexpected output shape.")
    max_absolute_difference = float(np.max(np.abs(torch_logits - onnx_logits)))
    np.testing.assert_allclose(torch_logits, onnx_logits, rtol=1e-4, atol=1e-5)

    artifact = {
        **metadata,
        "onnx_path": str(output_path.resolve()),
        "onnx_sha256": sha256_file(output_path),
        "onnx_opset": 17,
        "input_name": "landmarks",
        "input_shape": ["batch", 30, 225],
        "output_name": "logits",
        "output_shape": ["batch", class_count],
        "parity_samples": int(batch.shape[0]),
        "max_absolute_logit_difference": max_absolute_difference,
        "parity_verified": True,
    }
    metadata_path = output_path.with_suffix(".metadata.json")
    metadata_path.write_text(json.dumps(artifact, indent=2), encoding="utf-8")
    return artifact
