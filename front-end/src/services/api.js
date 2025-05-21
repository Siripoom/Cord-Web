import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

//setup axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "skip-browser-warning",
    },
});


export const register = async (data) => {
    try {
        const response = await api.post("/auth/register", data)
        return response.data
    } catch (error) {
        console.log(error)
    }


}
export const login = async (data) => {
    try {
        console.log("Login response:", data);
        const response = await api.post("/auth/login", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

// User 
export const getUser = async (token) => {
    try {
        const response = await api.get("/user");
        return response.data;
    } catch (error) {
        console.log(error)
    }
}


export const getUserById = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/user/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const addUser = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.post("/user", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const updateUser = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put("/user", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const updateUserPassword = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put("/user/password", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const updateUserProfile = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put("/user/profile", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const updateUserProfileImage = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put("/user/profile/image", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

// Customers
export const getCustomers = async (token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/customers");
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const addCustomer = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.post("/customers", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const updateCustomer = async (data, id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put(`/customers/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const deleteCustomer = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.delete(`/customers/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const getCustomerById = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/customers/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const getCustomerInvoices = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/customers/${id}/invoices`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const getCustomerQueues = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/customers/${id}/queues`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

// Suppliers
export const getSuppliers = async (token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/suppliers");
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const addSupplier = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.post("/suppliers", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const updateSupplier = async (data, id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put(`/suppliers/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const deleteSupplier = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.delete(`/suppliers/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const getSupplierById = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/suppliers/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

// Products

export const getProducts = async (token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/products");
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const getProductById = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const getProductsByCategory = async (category, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/products/category/${category}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const getProductStats = async (token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/products/stats");
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const addProduct = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.post("/products", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const updateProduct = async (data, id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const deleteProduct = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.delete(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

// Fuel 
export const getFuelCosts = async (token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/fuel");
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const getFuelCostById = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/fuel/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const addFuelCost = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.post("/fuel", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const updateFuelCost = async (data, id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put(`/fuel/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const deleteFuelCost = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.delete(`/fuel/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

// Vehicles
export const getVehicles = async (token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/vehicles");
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const getVehicleById = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/vehicles/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const addVehicle = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.post("/vehicles", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const updateVehicle = async (data, id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put(`/vehicles/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const deleteVehicle = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.delete(`/vehicles/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const getVehicleMaintenance = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/vehicles/${id}/maintenances`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const getVehicleFuelCosts = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/vehicles/${id}/fuel`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

// Driver 
export const getDrivers = async (token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/driver");
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const getDriverById = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/driver/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const addDriver = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.post("/driver", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const updateDriver = async (data, id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put(`/driver/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const deleteDriver = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.delete(`/driver/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

// Truck Queue
export const getTruckQueues = async (token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/truck-queues");
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const getTruckQueueById = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/truck-queues/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const addTruckQueue = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.post("/truck-queues", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const updateTruckQueue = async (data, id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put(`/truck-queues/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
export const deleteTruckQueue = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.delete(`/truck-queues/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

// Maintenance
export const getMaintenance = async (token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/maintenances");
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const getMaintenanceById = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/maintenances/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const addMaintenance = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.post("/maintenances", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const updateMaintenance = async (data, id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put(`/maintenances/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const deleteMaintenance = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.delete(`/maintenances/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

// Cost
export const getCosts = async (token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/costs");
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const getCostById = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/costs/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const addCost = async (data, token) => {
    console.log("Add cost data:", data);
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.post("/costs", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const updateCost = async (data, id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put(`/costs/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const deleteCost = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.delete(`/costs/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

// Invoice Supplier
export const getInvoiceSupplier = async (token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/invoices-supplier");
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const getInvoiceSupplierById = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/invoices-supplier/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const addInvoiceSupplier = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.post("/invoices-supplier", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const updateInvoiceSupplier = async (data, id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put(`/invoices-supplier/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const deleteInvoiceSupplier = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.delete(`/invoices-supplier/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

// Invoice Customer
export const getInvoiceCustomer = async (token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/invoices-customer");
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const getInvoiceCustomerById = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get(`/invoices-customer/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const addInvoiceCustomer = async (data, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.post("/invoices-customer", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const updateInvoiceCustomer = async (data, id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.put(`/invoices-customer/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

export const deleteInvoiceCustomer = async (id, token) => {
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.delete(`/invoices-customer/${id}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}



