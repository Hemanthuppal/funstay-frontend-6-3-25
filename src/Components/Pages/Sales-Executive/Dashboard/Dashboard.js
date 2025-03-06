import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { AuthContext } from "../../../AuthContext/AuthContext";
import Navbar from '../../../Shared/Sales-ExecutiveNavbar/Navbar';
import FollowUp from "./FollowUp";
import { baseURL } from "../../../Apiservices/Api";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../../Shared/Themes/ThemeContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userId } = useContext(AuthContext); // Get userId from context
  const [collapsed, setCollapsed] = useState(false);
  const { themeColor } = useContext(ThemeContext);
  const [selectedDay, setSelectedDay] = useState("Tue");
  const [counts, setCounts] = useState({
    leadsToday: 0,
    confirmedToday: 0,
    inProgressToday: 0,
    leadsYesterday: 0,
    confirmedYesterday: 0,
    inProgressYesterday: 0,
    metaAdsCount: 0,
    notMetaAdsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoints = [
          `${baseURL}/lead/today/${userId}`,
          `${baseURL}/lead/confirmed/${userId}`,
          `${baseURL}/lead/in-progress/${userId}`,
          `${baseURL}/lead/yesterday/${userId}`,
          `${baseURL}/lead/confirmed/yesterday/${userId}`,
          `${baseURL}/lead/in-progress/yesterday/${userId}`,
          `${baseURL}/lead/meta-ads/${userId}`,
          `${baseURL}/lead/not-meta-ads/${userId}` 
        ];
  
        const responses = await Promise.all(
          endpoints.map(url => axios.get(url))
        );
  
        console.log("API Responses:", responses); // Log the responses
  
        setCounts({
          leadsToday: responses[0].data.count,
          confirmedToday: responses[1].data.count,
          inProgressToday: responses[2].data.count,
          leadsYesterday: responses[3].data.count,
          confirmedYesterday: responses[4].data.count,
          inProgressYesterday: responses[5].data.count,
          metaAdsCount: responses[6].data.count,
          notMetaAdsCount: responses[7].data.count 
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const totalLeads = counts.metaAdsCount + counts.notMetaAdsCount;

  // Calculate width percentage for Meta Ads
  const metaAdsWidth = totalLeads > 0 ? (counts.metaAdsCount / totalLeads) * 100 : 0;

  // Calculate width percentage for Others
  const notMetaAdsWidth = totalLeads > 0 ? (counts.notMetaAdsCount / totalLeads) * 100 : 0;

  const scheduleData = [
    {
      day: "Tue",
      schedules: [
        {
          time: "10:00 - 11:00 AM",
          title: "Adlash Project Estimation Meeting",
          color: "Manager-badge-orange",
          lead: "Siritha Alwar",
        },
        {
          time: "11:00 - 11:30 AM",
          title: "Dashboard HTML Design Review",
          color: "Manager-badge-green",
          lead: "Jonathon Andy",
        },
        {
          time: "12:00 - 1:30 PM",
          title: "Dashboard UI/UX Design Review",
          color: "Manager-badge-blue",
          lead: "John Harry",
        },
      ],
    },
  ];

  const todaySchedule = scheduleData.find((data) => data.day === selectedDay);

  return (
    <div className="dashboardContainer1">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`dashboard1 ${collapsed ? 'collapsed' : ''}`}>
        <div className="container">
          {/* Cards Section */}
          <div className="row Manager-dashboard-cards-container justify-content-center mt-4"style={{ "--theme-color": themeColor }}>
            <div className="col-lg-7 col-md-12">
              <div className="row">
                {[
                  {
                    title: "Leads Today",
                    value: counts.leadsToday,
                    subtitle: `Leads Yesterday: ${counts.leadsYesterday}`,
                    navigateTo: "/View-lead"
                  },
                  {
                    title: "Leads Confirmed Today",
                    value: counts.confirmedToday,
                    subtitle: `Confirmed Yesterday: ${counts.confirmedYesterday}`,
                    navigateTo: "/potential-leads"
                  },
                  {
                    title: "Leads In-Progress Today",
                    value: counts.inProgressToday,
                    subtitle: `In-Progress Yesterday: ${counts.inProgressYesterday}`,
                    navigateTo: "/View-lead"
                  },
                  // {
                  //   title: "Quotation Generated Today",
                  //   value: "02",
                  //   subtitle: "Leads Rejected Yesterday: 00",
                  //   navigateTo: "#" // Keep static if no backend data
                  // },
                ].map((card, index) => (
                  <div className="col-lg-6 col-md-6 col-sm-6 mb-3  mt-2" key={index}
                  onClick={() => card.navigateTo !== "#" && navigate(card.navigateTo)} // Navigate only if not static
                  style={{ cursor: card.navigateTo !== "#" ? "pointer" : "default" }}>
                    <div className="card Manager-gradient-card">
                      <h5 className="pt-3">{card.title}</h5>
                      <h2>{card.value}</h2>
                      <p>{card.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card Manager-lead-card p-3 mt-4">
                <h5>Most Lead</h5>
                <div>
                  {[
                    {
                      label: "Social Media",
                      icon: "fa-solid fa-share-nodes",
                      value: counts.metaAdsCount,
                      width: `${metaAdsWidth}%`, // Set dynamic width for Meta Ads
                      color: "#6c63ff",
                    },
                    {
                      label: "Others",
                      icon: "fa-solid fa-layer-group",
                      value: counts.notMetaAdsCount,
                      width: `${notMetaAdsWidth}%`, // Set dynamic width for Others
                      color: "#dc3545",
                    },
                  ].map((lead, index) => (
                    <div
                      key={index}
                      className="Manager-lead-item mb-3 d-flex align-items-center"
                    >
                      <div className="Manager-icon-container me-3">
                        <i
                          className={`${lead.icon}`}
                          style={{ color: lead.color }}
                        ></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 d-flex justify-content-between">
                          <span>{lead.label}</span>
                          <span>{lead.value}</span>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{
                              width: lead.width,
                              backgroundColor: lead.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Follow-up Schedule Section */}
            <div className="col-lg-5 col-md-12 mt-4">
              <FollowUp schedule={todaySchedule?.schedules || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;