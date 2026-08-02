/**
 * AURA Emotional Intelligence Engine — VisionFeatures Domain Value Object
 * Phase 5: Typed input contract for VisionEmotionDetector.
 *
 * VisionFeatures encapsulates the facial landmark metrics extracted from a single
 * video frame or image. These values would be provided by an upstream facial analysis
 * layer (MediaPipe FaceMesh, OpenCV, or a server-side vision pipeline). The domain
 * layer remains completely decoupled from the extraction implementation.
 *
 * All values use normalized 0.0–1.0 scales (or documented units) for consistency
 * and framework-agnostic design.
 *
 * Contains ZERO runtime code — pure TypeScript type definitions only.
 */

/**
 * Facial expression feature payload extracted from a camera frame.
 * Each property represents a distinct visual characteristic that correlates
 * with specific emotional states in affective computing research.
 */
export interface VisionFeatures {
  /**
   * Smile intensity score derived from mouth corner elevation and cheek raise.
   * Scale: 0.0 (no smile) to 1.0 (full, open smile).
   * High score strongly correlates with happiness or excitement.
   */
  smileScore: number;

  /**
   * Brow tension — degree of brow lowering/furrowing (Action Units AU4, AU5).
   * Scale: 0.0 (fully relaxed) to 1.0 (maximally furrowed).
   * High tension correlates with anger, confusion, concentration, or worry.
   */
  browTension: number;

  /**
   * Eye openness ratio relative to the neutral baseline (AU5, AU7, AU43).
   * Scale: 0.0 (eyes nearly closed) to 1.0 (eyes wide open).
   * Wide eyes correlate with surprise or excitement.
   * Narrowed eyes correlate with anger, suspicion, or sadness.
   */
  eyeOpenness: number;

  /**
   * Mouth openness ratio (vertical lip distance / face height).
   * Scale: 0.0 (mouth fully closed) to 1.0 (mouth maximally open).
   * High openness correlates with surprise, excitement, or distress.
   */
  mouthOpenness: number;

  /**
   * Head tilt in degrees relative to the camera vertical axis.
   * Range: -45.0 (tilted left) to +45.0 (tilted right).
   * Lateral tilt often correlates with curiosity or thoughtfulness.
   * Near-zero values indicate attentive, neutral posture.
   */
  headTilt: number;
}
