import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaCalendarCheck, FaUserCheck, FaWalking, FaBriefcase, FaTachometerAlt, FaBell, FaEnvelope, FaCaretDown, FaRegAddressBook, FaCalendarAlt, FaBullhorn, FaUsersCog, FaHome, FaClipboardList, FaChartLine, FaUserFriends, FaPeopleCarry } from "react-icons/fa";
import { IoHomeOutline, IoMenu } from "react-icons/io5";
import "./Navbar.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../../AuthContext/AuthContext";
import { baseURL } from "../../Apiservices/Api";
import { ThemeContext } from "../Themes/ThemeContext";

const Manager = ({ onToggleSidebar }) => {
  const [formData, setFormData] = useState({
    imageUrl: "",
  });
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { themeColor } = useContext(ThemeContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // State for toggle menu
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const navigate = useNavigate();
  const { logout, userName, userId, authToken } = useContext(AuthContext);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    onToggleSidebar(!collapsed);
  };

  const handleNavItemClick = () => {
    if (window.innerWidth <= 768) {
      setCollapsed(true);
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
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
      navigate(`/m-opportunity-comments/${notification.leadid}`);
    } else {
      navigate('/m-view-leads');
    }

    // Use a timeout to ensure navigation happens before the reload
    setTimeout(() => {
      window.location.reload();
    }, 0);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${baseURL}/api/notifications?managerid=${userId}`);
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
      <div className="manager-container">
        <div className="manager-header" style={{ "--theme-color": themeColor }}>
          <div className="manager-header-left">
            <div
              className={`manager-sidebar-toggle ${collapsed ? 'collapsed' : ''}`}
              onClick={toggleSidebar}
            >
              <IoMenu className="toggle-icon" />
            </div> &nbsp;&nbsp;
            <img src='https://primary0101211.s3.ap-south-1.amazonaws.com/v3/assets/images/Logo.png' alt="Logo" className="manager-company-logo" />
          </div>
          <h2 className="text-center user-manager" style={{ color: 'white' }}> {userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : ""} - Manager</h2>

          <div className="manager-header-right">
            {/* Add Leads Button */}
            {/* <button className="btn btn-primary lead-button">Add Leads</button> */}

            <div className="manager-header-icons">
              <div className="manager-nav-icon-container" onClick={toggleNotificationDropdown}>
                <FaBell className="manager-nav-icon" />
                {notifications.length > 0 && <span className="manager-nav-badge">{notifications.length}</span>}
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
              {/* <div className="manager-nav-icon-container">
                <FaEnvelope className="manager-nav-icon" />
                <span className="manager-nav-badge">24</span>
              </div> */}

              <div className="manager-nav-icon-container" onClick={handleProfileClick}>
                <div className="manager-nav-profile">
                  {formData.imageUrl ? (
                    <img
                      src={`${baseURL}${formData.imageUrl}`}
                      alt="Profile"
                      className="manager-nav-profile-img"
                    />
                  ) : (
                    <img
                      src="https://i.pravatar.cc/100?img=4" // Fallback image
                      alt="Default Profile"
                      className="manager-nav-profile-img"
                    />
                  )}
                  {/* <img
                    src="https://i.pravatar.cc/40?img=4"
                    alt="Profile"
                    className="manager-nav-profile-img"
                  /> */}
                  <FaCaretDown className="manager-nav-caret-icon" />
                </div>
                {showDropdown && (
                  <div className="manager-nav-profile-dropdown">
                    <div className="manager-nav-profile-header">
                      <strong> {userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : ""}</strong>

                    </div>
                    <div
                      className="manager-nav-profile-item"
                      onClick={() => navigate("/m-profile")}
                    >
                      Your Profile
                    </div>
                    {/* <div className="manager-nav-profile-item">Your Profile</div> */}
                    {/* <div className="manager-nav-profile-item">Settings</div>
                    <div className="manager-nav-profile-item">Help Center</div> */}
                    <div className="manager-nav-profile-item" onClick={handleLogout}>Sign Out</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        <div className={`manager-sidebar ${collapsed ? 'collapsed' : ''}`} style={{ "--theme-color": themeColor }}>
          <div className="manager-position-sticky">
            <ul className="nav flex-column">
              <li className={`manager-nav-item ${location.pathname.startsWith("/m-dashboard") ? "active"
                : ""
                }`}>
                <Link className="nav-link" to="/m-dashboard" onClick={handleNavItemClick}>
                  <FaHome className="manager-nav-icon" />
                  {!collapsed && <span className="link_text">Dashboard</span>}
                </Link>
              </li>
              <li className={`manager-nav-item ${location.pathname.startsWith("/m-allleads") ||
                location.pathname.startsWith("/m-viewallleads")
                ? "active"
                : ""
                }`}>
                <Link className="nav-link" to="/m-allleads" onClick={handleNavItemClick}>
                  <FaUsers className="manager-nav-icon" />
                  {!collapsed && <span className="link_text">All Leads</span>}
                </Link>
              </li>

              <li
                className={`manager-nav-item ${location.pathname.startsWith("/m-view-leads") ||
                  location.pathname.startsWith("/m-edit-lead") ||
                  location.pathname.startsWith("/m-add-leads") ||
                  location.pathname.startsWith("/m-comments") ||
                  location.pathname.startsWith("/m-view-lead") ||
                  location.pathname.startsWith("/m-create-customer-opportunity")
                  ? "active"
                  : ""
                  }`}
              >
                <Link className="nav-link" to="/m-view-leads" onClick={handleNavItemClick}>
                  <FaUserCheck className="manager-nav-icon" />
                  {!collapsed && <span className="link_text">My Team Leads</span>}
                </Link>
              </li>

              <li
                className={`manager-nav-item ${location.pathname.startsWith("/m-myview-leads") ||
                  location.pathname.startsWith("/m-myedit-lead") ||
                  location.pathname.startsWith("/m-myadd-leads") ||
                  location.pathname.startsWith("/m-mycomments") ||
                  location.pathname.startsWith("/m-myview-lead") ||
                  location.pathname.startsWith("/m-mycreate-customer-opportunity")
                  ? "active"
                  : ""
                  }`}
              >
                <Link className="nav-link" to="/m-myview-leads" onClick={handleNavItemClick}>
                  <FaClipboardList className="manager-nav-icon" />
                  {!collapsed && <span className="link_text">My Leads</span>}
                </Link>
              </li>

              <li
                className={`manager-nav-item ${location.pathname.startsWith("/m-potential-leads") ||
                  location.pathname.startsWith("/m-edit-opportunity") ||
                  location.pathname.startsWith("/m-opportunity-comments") ||
                  location.pathname.startsWith("/m-details")
                  ? "active"
                  : ""
                  }`}
              >
                <Link className="nav-link" to="/m-potential-leads" onClick={handleNavItemClick}>
                  <FaChartLine className="manager-nav-icon" />
                  {!collapsed && <span className="link_text">My Team's Opportunities</span>}
                </Link>
              </li>

              <li
                className={`manager-nav-item ${location.pathname.startsWith("/m-myOpp") ||
                  location.pathname.startsWith("/m-myedit-opportunity") ||
                  location.pathname.startsWith("/m-myopportunity-comments") ||
                  location.pathname.startsWith("/m-mydetails")
                  ? "active"
                  : ""
                  }`}
              >
                <Link className="nav-link" to="/m-myOpp" onClick={handleNavItemClick}>
                  <FaBriefcase className="manager-nav-icon" />
                  {!collapsed && <span className="link_text">My Opportunities</span>}
                </Link>
              </li>

              <li
                className={`manager-nav-item ${["/m-customers", "/m-customer-details", "/m-customerdetails", "/m-editcustomerdetails"].some(path => location.pathname.includes(path))
                  ? "active"
                  : ""
                  }`}
              >
                <Link className="nav-link" to="/m-customers" onClick={handleNavItemClick}>
                  <FaUserFriends className="manager-nav-icon" />
                  {!collapsed && <span className="link_text">My Teams customer</span>}
                </Link>
              </li>


              <li
                className={`manager-nav-item ${location.pathname === "/m-myteam" ? "active" : ""
                  }`}
              >
                <Link className="nav-link" to="/m-myteam" onClick={handleNavItemClick}>
                  <FaPeopleCarry className="manager-nav-icon" />
                  {!collapsed && <span className="link_text">My Teams </span>}
                </Link>
              </li>

            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Manager;
