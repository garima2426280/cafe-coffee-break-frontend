export function getImageUrl(filename) {
  if (!filename) return null;
  if (filename.startsWith("http")) return filename;
  const base = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace("/api", "")
    : "http://localhost:5000";
  return `${base}/uploads/${filename}`;
}