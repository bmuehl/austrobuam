export function albumPointerTilt(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }) {
  const dx = clientX - rect.left - rect.width / 2;
  const dy = clientY - rect.top - rect.height / 2;
  const radius = Math.max(1, Math.min(rect.width, rect.height) / 2);
  const outside = Math.hypot(Math.max(0, Math.abs(dx) - rect.width / 2), Math.max(0, Math.abs(dy) - rect.height / 2));
  const strength = 0.5 / (1 + (outside / (radius * 1.5)) ** 2);
  // Ease through the center without a direction jump; fade gradually beyond the cover.
  return { x: Math.tanh(dx / (radius * 0.65)) * strength, y: Math.tanh(dy / (radius * 0.65)) * strength };
}
