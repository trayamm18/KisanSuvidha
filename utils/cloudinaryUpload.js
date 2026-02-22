export const uploadToCloudinary = async (imageUri) => {
  const data = new FormData();
  data.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "upload.jpg",
  });
  data.append("upload_preset", "unsigned_kisan");
  data.append("cloud_name", "dkm7msss8");

  const res = await fetch("https://api.cloudinary.com/v1_1/dkm7msss8/image/upload", {
    method: "POST",
    body: data,
  });

  const result = await res.json();
  return result.secure_url;
};
