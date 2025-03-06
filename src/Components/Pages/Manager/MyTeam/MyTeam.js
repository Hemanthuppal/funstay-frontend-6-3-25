import React, { useState, useEffect, useContext } from 'react';
import DataTable from './../../../Layout/Table/TableLayout'; 
import Navbar from "../../../Shared/ManagerNavbar/Navbar";

import './MyTeam.css';
import { AuthContext } from '../../../AuthContext/AuthContext';
import { baseURL } from '../../../Apiservices/Api';

const MyTeam = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { authToken, userRole, userId } = useContext(AuthContext);
  const [data, setData] = useState([]);


  const columns = React.useMemo(
    () => [
     

      {
        Header: "Employee ID",
        accessor: "id",
        Cell: ({ value }) => `EMP${String(value).padStart(5, "0")}`, 
      },
            {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Mobile',
        accessor: 'mobile',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
    
        {
          Header: "Designation",
          accessor: "role",
          Cell: ({ value }) => (value === "employee" ? "Associate - Sales & Operations" : value),
        },
     
      
     
    ],
    []
  );

 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/employees/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`, 
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch employees data');
        }

        const result = await response.json();
        setData(result); 
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchData();
  }, [authToken, userId]);

  
 

  return (
    <div className="manager-myteamcontainer">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`manager-myteam ${collapsed ? "collapsed" : ""}`}>
        <div className="manager-myteam-container mb-5">
          <div className="manager-myteam-table-container">
            <h2 className="text-center">My Team</h2>
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTeam;
