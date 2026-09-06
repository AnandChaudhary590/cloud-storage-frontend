// import axios from "axios";

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
// });

// export default api;


import axios from "axios";

const api = axios.create({
  baseURL: "https://cloud-storage-backend-u4cd.onrender.com/api",
});

export default api;