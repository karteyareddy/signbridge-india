---
name: isl-computer-vision
description: Triggered when working on camera access, video processing, MediaPipe integration, or landmark extraction.
---
# ISL Computer Vision

**CRITICAL PRIVACY RULE:**
- **NEVER** store or transmit raw camera video frames.

**Implementation Strategy:**
- **Capture**: Use standard HTML5 `getUserMedia`.
- **Extraction**: Run MediaPipe JS (Hands/Pose) locally in the browser on the client's device.
- **Transmission**: Send ONLY the extracted, normalized 3D landmarks (x,y,z arrays) to the inference server.
- **Normalization**: Ensure landmarks are normalized relative to the torso/shoulders to handle varying camera distances.
