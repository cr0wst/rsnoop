export function isValidJson(str: string | null) {
  if (str === null) return false;

  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
