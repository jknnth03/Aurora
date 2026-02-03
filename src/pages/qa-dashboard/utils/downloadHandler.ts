export function handleFileDownload(blob: Blob, fileName: string) {
  // Create a URL for the blob
  const url = window.URL.createObjectURL(new Blob([blob]));

  // Create a temporary anchor element
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName); // Set the file name for download

  // Append link to body, click it, and remove it
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Clean up the blob URL
  window.URL.revokeObjectURL(url);
}
