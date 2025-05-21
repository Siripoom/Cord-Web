import { useState, useEffect } from "react";
import { Tabs } from "antd";
import { UserOutlined, CarOutlined } from "@ant-design/icons";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import Drivers from "./User/Drivers";
import Trucks from "./Truck/Trucks";

import "./User.css";
import PropTypes from "prop-types";
import { getDrivers, getUser, getVehicles } from "../../services/api";

const { TabPane } = Tabs;

const UserAndTruck = ({ sidebarVisible, toggleSidebar }) => {
  const [activeTab, setActiveTab] = useState("1");
  const [searchText, setSearchText] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const token = localStorage.getItem("token");

  // Example: Fetch data for drivers and trucks from an API
  const fetchData = async () => {
    try {
      const res = await getDrivers(token); // Replace with actual API
      console.log("driversRes : ", res)
      let dataSorce = []
      res?.data.forEach((driver) => {
        let data = {
          id: driver.id,
          name: driver.name,
          address: driver.address,
          birthDay: driver.birthDay,
          licenseExpire: driver.licenseExpire,
          licenseNo: driver.licenseNo,
          phone: driver.phone,
          licenseType: driver.licenseType,
          workStart: driver.workStart,
          assignedVehicle: driver.vehicle || [],
        }
        dataSorce.push(data)
        console.log("Vehicle " , driver.vehicle)
      })
      console.log("dataSorceDriver : ", dataSorce)


      const resVehicles = await getVehicles(token); // Replace with actual API
      let dataSorceVehicle = []

      resVehicles.data.forEach((vehicle) => {
        let data = {
          id: vehicle.id,
          plateNumber: vehicle.plateNumber,
          model: vehicle.model,
          capacity: vehicle.capacity,
          type: vehicle.type,
          assignedDriver: vehicle.Driver[0] || [],
        }
        dataSorceVehicle.push(data)
      })
      console.log("dataSorceVehicle", dataSorceVehicle)
      setDrivers(dataSorce);
      setTrucks(dataSorceVehicle);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch drivers and trucks data from your API or backend
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Function to ensure data consistency when one component updates
  const updateRelationships = () => {
    const updatedTrucks = trucks.map((truck) => {
      if (truck.assignedDriver) {
        const currentDriver = drivers.find(
          (d) => d.id === truck.assignedDriver.id
        );
        if (currentDriver) {
          return {
            ...truck,
            assignedDriver: {
              id: currentDriver.id,
              name: currentDriver.name,
              phone: currentDriver.phone,
            },
          };
        }
        return { ...truck, assignedDriver: null };
      }
      return truck;
    });

    const updatedDrivers = drivers.map((driver) => {
      if (driver.assignedVehicle) {
        const currentVehicle = trucks.find(
          (t) => t.id === driver.assignedVehicle.id
        );
        if (currentVehicle) {
          return {
            ...driver,
            assignedVehicle: {
              id: currentVehicle.id,
              plateNumber: currentVehicle.plateNumber,
              model: currentVehicle.model,
            },
          };
        }
        return { ...driver, assignedVehicle: null };
      }
      return driver;
    });

    // Only update the state if changes are detected to avoid triggering another update
    if (JSON.stringify(updatedTrucks) !== JSON.stringify(trucks)) {
      setTrucks(updatedTrucks);
    }
    if (JSON.stringify(updatedDrivers) !== JSON.stringify(drivers)) {
      setDrivers(updatedDrivers);
    }
  };

  // Call updateRelationships only when drivers or trucks change
  useEffect(() => {
    updateRelationships();
  }, [drivers, trucks]);

  return (
    <div className={`admin-layout ${sidebarVisible ? "" : "sidebar-closed"}`}>
      {sidebarVisible && <Sidebar />}
      <div className="content-area">
        <Header title="จัดการรถและพนักงานขับรถ" toggleSidebar={toggleSidebar} />
        <div className="user-container">
          <div className="content-wrapper">
            <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
              <TabPane
                tab={
                  <span>
                    <UserOutlined /> พนักงานขับรถ
                  </span>
                }
                key="1"
              >
                <Drivers
                  trucks={trucks}
                  drivers={drivers}
                  setDrivers={setDrivers}
                  searchText={searchText}
                  setSearchText={setSearchText}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <CarOutlined /> รถบรรทุก
                  </span>
                }
                key="2"
              >
                <Trucks
                  drivers={drivers}
                  trucks={trucks}
                  setTrucks={setTrucks}
                  searchText={searchText}
                  setSearchText={setSearchText}
                />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

UserAndTruck.propTypes = {
  sidebarVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default UserAndTruck;
