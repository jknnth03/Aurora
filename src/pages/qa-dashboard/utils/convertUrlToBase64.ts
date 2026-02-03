export async function convertUrlToBase64(urls: string[]) {
  const entries = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url);
      const blob = await res.blob();

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return [url, base64] as const;
    })
  );

  return Object.fromEntries(entries);
}
