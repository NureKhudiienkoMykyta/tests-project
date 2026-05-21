import axios from "axios";
import { BASE_URL } from "../api/httpClient";

export const getAllUniversities = async () => {
  const response = await axios.get(`${BASE_URL}/university/`);
  return response.data;
};
