import React, { useState,useContext ,useEffect} from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaCalendarCheck, FaUmbrellaBeach, FaWalking, FaFileInvoiceDollar, FaTachometerAlt, FaMapMarkerAlt,FaBell, FaEnvelope, FaCaretDown,FaRegAddressBook, FaCalendarAlt, FaBullhorn, FaUsersCog, FaHome, FaClipboardList, FaChartLine, FaUserFriends, FaPeopleCarry, FaHSquare          } from "react-icons/fa";
import { IoHomeOutline, IoMenu } from "react-icons/io5";
import "./Navbar.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate,useLocation } from 'react-router-dom';
import { AuthContext } from "../../AuthContext/AuthContext";
import { baseURL } from "../../Apiservices/Api";
import { adminMail } from "../../Apiservices/Api";

const Navbar = ({ onToggleSidebar }) => {
  const [formData, setFormData] = useState({
    imageUrl: "",
  });
  const [collapsed, setCollapsed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // State for toggle menu
  const navigate = useNavigate();
  const location = useLocation();
  const { logout ,userName,userId,authToken} = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    onToggleSidebar(!collapsed);
  };

  useEffect(() => {
    // Fetch employee details when the component mounts
    const fetchEmployeeDetails = async () => {
      try {
        const response = await fetch(`${baseURL}/employee/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json();
        setFormData({
          imageUrl: data.image || "", // Assuming image URL is returned
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchEmployeeDetails();
  }, [userId, authToken]);

  const handleNavItemClick = () => {
    if (window.innerWidth <= 768) {
      setCollapsed(true);
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  
  const handleLogout = () => {
    logout(); // Clears authToken, userRole, and userId
    console.log('Logged out');
    navigate('/'); // Redirect to the home or login page
  };

  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch(`${baseURL}/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    await markNotificationAsRead(notification.id);
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    setShowNotificationDropdown(false);
  
    // Navigate based on whether the notification has a leadid
    if (notification.leadid) {
      navigate(`/a-opportunity-comments/${notification.leadid}`);
    } else {
      navigate('/a-view-lead');
    }
  
     // Use a timeout to ensure navigation happens before the reload
     setTimeout(() => {
      window.location.reload();
    }, 0);
  };

  useEffect(() => {
    const email= `${adminMail}`;
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${baseURL}/email/notifications?managerid=${email}`);
        const data = await response.json();
        if (data.notifications) setNotifications(data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <>
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-header-left">
            <div
              className={`admin-sidebar-toggle ${collapsed ? 'collapsed' : ''}`}
              onClick={toggleSidebar}
            >
              <IoMenu className="toggle-icon" />
            </div> &nbsp;&nbsp;
            <img src={'https://primary0101211.s3.ap-south-1.amazonaws.com/v3/assets/images/Logo.png'} alt="Logo" className="admin-company-logo" />
          </div>
          <h2 className="text-center user-admin" style={{ color: 'white' }}>{userName}</h2>

          <div className="admin-header-right">
            {/* Add Leads Button */}
           

            <div className="admin-header-icons">
              <div className="admin-nav-icon-container" onClick={toggleNotificationDropdown}>
                <FaBell className="admin-nav-icon" />
                {/* <span className="admin-nav-badge">12</span> */}
                {notifications.length > 0 && <span className="admin-nav-badge">{notifications.length}</span>}
                      {showNotificationDropdown && (
                        <div className="notification-dropdown">
                          <div className="notification-dropdown-header">Notifications</div>
                          <div className="notification-dropdown-body">
                            {notifications.length === 0 ? (
                              <div className="notification-item">No new notifications</div>
                            ) : (
                              notifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className="notification-item"
                                  onClick={() => handleNotificationClick(notification)}
                                  style={{ padding: "8px", cursor: "pointer" }}
                                >
                                  {/* <div style={{ fontWeight: notification.read ? "normal" : "bold" }}>
                                    {notification.message}
                                    
                                  </div> */}
                                  <div style={{ fontWeight: notification.read ? "normal" : "bold" }}>
  {notification.message.length > 40 
    ? `${notification.message.slice(0, 40)}...` 
    : notification.message}
</div>
                                  <div style={{ fontSize: "0.8em", color: "#888" }}>
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
              </div>
              {/* <div className="admin-nav-icon-container">
                <FaEnvelope className="admin-nav-icon" />
                <span className="admin-nav-badge">24</span>
              </div> */}

              <div className="admin-nav-icon-container" onClick={handleProfileClick}>
                <div className="admin-nav-profile">

                    {formData.imageUrl ? (
                          <img
                            src={`${baseURL}${formData.imageUrl}`}
                            alt="Profile"
                             className="admin-nav-profile-img"
                          />
                        ) : (
                          <img
                            src="https://i.pravatar.cc/100?img=4" // Fallback image
                            alt="Default Profile"
                             className="admin-nav-profile-img"
                          />
                        )}
                  {/* <img
                    src="https://i.pravatar.cc/40?img=4"
                    alt="Profile"
                    className="admin-nav-profile-img"
                  /> */}
                  <FaCaretDown className="admin-nav-caret-icon" />
                </div>
                {showDropdown && (
                  <div className="admin-nav-profile-dropdown">
                    <div className="admin-nav-profile-header">
                      <strong>{userName}</strong>
                    </div>
                    <div
      className="admin-nav-profile-item"
      onClick={() => navigate("/a-profile")}
    >
      Your Profile
    </div>
                    {/* <div className="admin-nav-profile-item">Your Profile</div> */}
                    {/* <div className="admin-nav-profile-item">Settings</div>
                    <div className="admin-nav-profile-item">Help Center</div> */}
                    <div className="admin-nav-profile-item" onClick={handleLogout}>Sign Out</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
          <div className="admin-position-sticky">
            <ul className="nav flex-column">
              <li  className={`admin-nav-item ${location.pathname.startsWith("/dashboard") ? "active"
                  : ""
                  }`}>
                <Link className="nav-link" to="/dashboard" onClick={handleNavItemClick}>
                  <FaHome className="admin-nav-icon" />
                  {!collapsed && <span className="link_text">Dashboard</span>}
                </Link>
              </li>

              <li
                className={`admin-nav-item ${location.pathname.startsWith("/a-view-lead") ||
                  location.pathname.startsWith("/a-edit-lead") ||
                  location.pathname.startsWith("/a-add-leads") ||
                  location.pathname.startsWith("/a-comments") ||
                  location.pathname.startsWith("/a-view-lead") ||
                  location.pathname.startsWith("/a-create-customer-opportunity")
                  ? "active"
                  : ""
                  }`}
              >
                <Link className="nav-link" to="/a-view-lead" onClick={handleNavItemClick}>
                  <FaClipboardList className="admin-nav-icon" />
                  {!collapsed && <span className="link_text">All Leads</span>}
                </Link>
              </li>
              <li
                className={`admin-nav-item ${location.pathname.startsWith("/a-potential-leads") ||
                    location.pathname.startsWith("/a-edit-opportunity") ||
                    location.pathname.startsWith("/a-opportunity-comments") ||
                    location.pathname.startsWith("/a-details")
                    ? "active"
                    : ""
                  }`}
              >
                <Link className="nav-link" to="/a-potential-leads" onClick={handleNavItemClick}>
                  <FaChartLine className="admin-nav-icon" />
                  {!collapsed && <span className="link_text">All Opportunities</span>}
                </Link>
              </li>
              <li
                className={`admin-nav-item ${location.pathname.startsWith("/a-customers") ||                   
                    location.pathname.startsWith("/a-customer-details") ||
                    location.pathname.startsWith("/a-customerdetails") ||
                    location.pathname.startsWith("/a-editcustomerdetails") 
                    ? "active"
                    : ""
                  }`}
              >
                <Link className="nav-link" to="/a-customers" onClick={handleNavItemClick}>
                  <FaUserFriends className="admin-nav-icon" />
                  {!collapsed && <span className="link_text">All customer</span>}
                </Link>
              </li>
              <li
                className={`admin-nav-item ${location.pathname.startsWith("/a-destinations")                   
                    
                   
                    ? "active"
                    : ""
                  }`}
              >
                <Link className="nav-link" to="/a-destinations" onClick={handleNavItemClick}>
                  <FaMapMarkerAlt  className="admin-nav-icon" />
                  {!collapsed && <span className="link_text">All Destinations </span>}
                </Link>


               
              </li>
              <li
                className={`admin-nav-item ${location.pathname.startsWith("/a-allteams") ||                   
                    location.pathname.startsWith("/addemployee") ||
                    location.pathname.startsWith("/team-members") ||
                    location.pathname.startsWith("/editemployee") 
                   
                    ? "active"
                    : ""
                  }`}
              >
                <Link className="nav-link" to="/a-allteams" onClick={handleNavItemClick}>
                  <FaPeopleCarry className="admin-nav-icon" />
                  {!collapsed && <span className="link_text">All Teams </span>}
                </Link>


               
              </li>

              {/* <li
                className={`admin-nav-item ${location.pathname.startsWith("/a-viewonboarding") ||                   
                    location.pathname.startsWith("/a-onboarding") 
                  
                    ? "active"
                    : ""
                  }`}
              >
                <Link className="nav-link" to="/a-viewonboarding" onClick={handleNavItemClick}>
                  <FaPeopleCarry className="admin-nav-icon" />
                  {!collapsed && <span className="link_text">Onboarding Employees </span>}
                </Link>


               
              </li> */}


             
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
