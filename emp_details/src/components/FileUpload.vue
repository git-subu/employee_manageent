<template>
  <div class="container mt-5">
    <h2>Upload Employee Document</h2>
<!-- file input -->
    <form @submit.prevent="uploadFile">
      <div class="mb-3">
        <label class="form-label">Select File:</label>
        <input
          type="file"
          class="form-control"
          @change="handleFileUpload"
          accept=".pdf,.jpg,.jpeg,.png"
          required
        />
      </div>

      <button type="submit" class="btn btn-primary">Upload</button>
    </form>

    <h3 class="mt-4">Uploaded Files:</h3>
    <ul>
        <!-- display all uploaded file -->
      <li v-for="file in files" :key="file.id">
        <p style="margin-top: 20px">
          {{ file.file_name }}
          &nbsp;
          <button @click="deleteFile(file.id)" class="btn btn-danger mt-2">
            Delete
          </button>
        </p>

        <br />
        <iframe
          allowfullscreen
          v-if="isValidFile(file.file_name) && file.file_name.endsWith('.pdf')"
          :src="`http://localhost:5000/files/${file.id}`"
        ></iframe>

        <img
          v-else-if="!file.file_name.endsWith('.pdf')"
          style="width: 100%; max-height: 600px; object-fit: contain"
          :src="`http://localhost:5000/files/${file.id}`"
          alt=""
        />

        <p v-else>Invalid file type for preview</p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const selectedFile = ref(null);
const files = ref([]);

const handleFileUpload = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const fileType = file.type;
  const fileSizeMB = file.size / (1024 * 1024); // Convert size to MB

  // File size validation
  if (fileType === "application/pdf" && fileSizeMB > 30) {
    alert("PDF file size should not exceed 30MB.");
    return;
  }

  if (
    ["image/jpeg", "image/png", "image/jpg"].includes(fileType) &&
    fileSizeMB > 10
  ) {
    alert("Image file size should not exceed 10MB.");
    return;
  }
  console.log("selected file", file);
  selectedFile.value = file;
  console.log("selected file", selectedFile.value);
};

// Post request for file upload

const uploadFile = async () => {
  if (!selectedFile.value) {
    alert("Please select a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile.value);
  console.log("formdata", formData.values);

  try {
    const response = await axios.post(
      "http://localhost:5000/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    alert(response.data.message);

    fetchFiles(); // Refresh file list
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

// Fetch files including their IDs
const fetchFiles = async () => {
  try {
    const response = await axios.get("http://localhost:5000/files");
    files.value = response.data; // Now includes a`id` and `file_name`
  } catch (error) {
    console.error("Error fetching files:", error);
  }
};

// Check if the file is a valid preview type
const isValidFile = (fileName) => {
  return (
    fileName.endsWith(".pdf") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".png")
  );
};

onMounted(fetchFiles);

const deleteFile = async (id) => {
  if (!confirm("Are you sure you want to delete this file?")) return;

  try {
    const response = await axios.delete(`http://localhost:5000/delete/${id}`);
    alert(response.data.message);
    fetchFiles(); // Refresh file list after deletion
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};
</script>
<style>
iframe {
  width: 100%;
  height: auto;
  min-height: 500px;
  border: 1px solid #ccc;
  background: #f8f8f8;
  overflow: hidden;
}

img {
  width: 100%;
  height: auto;
  object-fit: contain;
}
</style>
