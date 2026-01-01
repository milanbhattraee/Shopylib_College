import handleRequest from "../utils/apiHandler";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export const getAllProducts = async() => {
    console.log("API URL:", apiUrl);
  const url = `${apiUrl}/products?page=1&limit=20`;
  const response = await handleRequest({ url, method: 'GET'});
  return response;
};