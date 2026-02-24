import api from "../api/Api.js";



const extractResponseData = (response) => {
  const wrapper = response.data || {};
  return wrapper?.data ?? wrapper?.message ?? wrapper ?? null;
};

//create package
export const addPackage = async (formData) => {
  const response = await api.post("/admin/add-package", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return extractResponseData(response);
};

//update package
export const updatePackage = async (packageId, formData) => {
  const response = await api.patch(`/admin/package/${packageId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return extractResponseData(response);
};

//delete package
export const deletePackage = async (packageId) => {
  const response = await api.delete(`/admin/package/${packageId}`);
  return extractResponseData(response);
};
