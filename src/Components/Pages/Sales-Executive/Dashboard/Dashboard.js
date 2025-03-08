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
    // metaAdsCount: 0,
    // notMetaAdsCount: 0
    facebookCount: 0,
    referralCount: 0,
    campaignCount: 0,
    googleCount: 0,
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
          // `${baseURL}/lead/meta-ads/${userId}`,
          // `${baseURL}/lead/not-meta-ads/${userId}`
          `${baseURL}/lead/facebook/${userId}`,
          `${baseURL}/lead/referral/${userId}`,
          `${baseURL}/lead/campaign/${userId}`,
          `${baseURL}/lead/google/${userId}`,
        ];

        const responses = await Promise.all(
          endpoints.map(url => axios.get(url))
        );

        console.log("API Responses:", responses); // Log the responses
        console.log("Leads Today:", responses[0].data);
        console.log("Confirmed Today:", responses[1].data);
        console.log("In Progress Today:", responses[2].data);
        console.log("Leads Yesterday:", responses[3].data);
        console.log("Confirmed Yesterday:", responses[4].data);
        console.log("In Progress Yesterday:", responses[5].data);
        console.log("Facebook Leads:", responses[6].data);
        console.log("Referral Leads:", responses[7].data);
        console.log("Campaign Leads:", responses[8].data);
        console.log("Google Leads:", responses[9].data);
        
        setCounts({
          leadsToday: responses[0].data.count,
          confirmedToday: responses[1].data.count,
          inProgressToday: responses[2].data.count,
          leadsYesterday: responses[3].data.count,
          confirmedYesterday: responses[4].data.count,
          inProgressYesterday: responses[5].data.count,
          // metaAdsCount: responses[6].data.count,
          // notMetaAdsCount: responses[7].data.count
          facebookCount: responses[6].data.count,
          referralCount: responses[7].data.count,
          campaignCount: responses[8].data.count,
          googleCount: responses[9].data.count,
          
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

  const totalLeads = counts.facebookCount + counts.referralCount + counts.campaignCount + counts.googleCount;

  // Calculate width percentage for Meta Ads
  const facebookWidth = totalLeads > 0 ? (counts.facebookCount / totalLeads) * 100 : 0;

  // Calculate width percentage for Others
  const referralWidth = totalLeads > 0 ? (counts.referralCount / totalLeads) * 100 : 0;

  const campaignWidth = totalLeads > 0 ? (counts.campaignCount / totalLeads) * 100 : 0;

  const googleWidth = totalLeads > 0 ? (counts.googleCount / totalLeads) * 100 : 0;

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
                    title: "Opportunities Today",
                    value: counts.confirmedToday,
                    subtitle: `Opportunities Yesterday: ${counts.confirmedYesterday}`,
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
                <h5>Leads Sources</h5>
                <div>
                  {[
                    {
                      label: "Facebook",
                      icon: "fa-brands fa-facebook",
                      value: counts.facebookCount,
                      width: `${facebookWidth}%`, 
                      color: "#1877F2",
                    },
                    {
                      label: "Referral",
                      icon: "fa-solid fa-user-plus",
                      value: counts.referralCount,
                      width: `${referralWidth}%`, 
                      color: "#28A745",
                    },
                    {
                      label: "Campaign",
                      icon: "fa-solid fa-bullhorn",
                      value: counts.campaignCount,
                      width: `${campaignWidth}%`, 
                      color: "#FFC107",
                    },
                    {
                      label: "Google",
                      icon: "fa-brands fa-google",
                      value: counts.googleCount,
                      width: `${googleWidth}%`, 
                      color: "#EA4335",
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