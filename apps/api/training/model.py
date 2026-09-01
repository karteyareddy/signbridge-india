from __future__ import annotations

import torch
from torch import nn


class ConstrainedISLGRU(nn.Module):
    def __init__(
        self,
        feature_count: int = 225,
        hidden_size: int = 128,
        class_count: int = 32,
        dropout: float = 0.25,
    ) -> None:
        super().__init__()
        self.gru = nn.GRU(
            input_size=feature_count,
            hidden_size=hidden_size,
            num_layers=2,
            dropout=dropout,
            batch_first=True,
        )
        self.normalise = nn.LayerNorm(hidden_size)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(hidden_size, class_count)

    def forward(self, landmarks: torch.Tensor) -> torch.Tensor:
        temporal_features, _ = self.gru(landmarks)
        pooled = temporal_features.mean(dim=1)
        return self.classifier(self.dropout(self.normalise(pooled)))
