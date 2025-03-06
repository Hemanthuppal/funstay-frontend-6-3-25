import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from "react-router-dom";
import Navbar from '../../../Shared/Navbar/Navbar';
import FollowUp from "./FollowUp";
import { baseURL } from "../../../Apiservices/Api";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate(); 
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
          `${baseURL}/leads/today`,
          `${baseURL}/leads/confirmed`,
          `${baseURL}/leads/in-progress`,
          `${baseURL}/leads/yesterday`,
          `${baseURL}/leads/confirmed/yesterday`,
          `${baseURL}/leads/in-progress/yesterday`,
          `${baseURL}/leads/meta-ads`,
          `${baseURL}/leads/not-meta-ads`
        ];

        const responses = await Promise.all(endpoints.map(url => axios.get(url)));

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
  }, []);

  if (loading) return <div className="loading-spinner">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboardContainer1">
      <Navbar onToggleSidebar={setCollapsed} />
      <div className={`dashboard1 ${collapsed ? 'collapsed' : ''}`}>
        <div className="container">
          <div className="row admin-dashboard-cards-container justify-content-center mt-4">
            <div className="col-lg-7 col-md-12">
              <div className="row">
                {[
                  {
                    title: "Leads Today",
                    value: counts.leadsToday,
                    subtitle: `Leads Yesterday: ${counts.leadsYesterday}`,
                    navigateTo: "/a-view-lead"
                  },
                  {
                    title: "Leads Confirmed Today",
                    value: counts.confirmedToday,
                    subtitle: `Confirmed Yesterday: ${counts.confirmedYesterday}`,
                    navigateTo: "/a-potential-leads"
                  },
                  {
                    title: "Leads In-Progress Today",
                    value: counts.inProgressToday,
                    subtitle: `In-Progress Yesterday: ${counts.inProgressYesterday}`,
                    navigateTo: "/a-view-lead"
                  },
                
                ].map((card, index) => (
                  <div 
                    className="col-lg-6 col-md-6 col-sm-6 mb-3" 
                    key={index}
                    onClick={() => card.navigateTo !== "#" && navigate(card.navigateTo)} 
                    style={{ cursor: card.navigateTo !== "#" ? "pointer" : "default" }}
                  >
                    <div className="card admin-gradient-card">
                      <h5 className="pt-3">{card.title}</h5>
                      <h2>{card.value}</h2>
                      <p>{card.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card admin-lead-card p-3 mt-4">
                <h5>Most Lead</h5>
                <div>
                  {[
                    {
                      label: "Social Media",
                      icon: "fa-solid fa-share-nodes",
                      value: counts.metaAdsCount,
                      width: `${(counts.metaAdsCount / (counts.metaAdsCount + counts.notMetaAdsCount)) * 100 || 0}%`,
                      color: "#6c63ff",
                    },
                    {
                      label: "Others",
                      icon: "fa-solid fa-layer-group",
                      value: counts.notMetaAdsCount,
                      width: `${(counts.notMetaAdsCount / (counts.metaAdsCount + counts.notMetaAdsCount)) * 100 || 0}%`,
                      color: "#dc3545",
                    },
                  ].map((lead, index) => (
                    <div key={index} className="admin-lead-item mb-3 d-flex align-items-center">
                      <div className="admin-icon-container me-3">
                        <i className={`${lead.icon}`} style={{ color: lead.color }}></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 d-flex justify-content-between">
                          <span>{lead.label}</span>
                          <span>{lead.value}</span>
                        </p>
                        <div className="progress">
                          <div className="progress-bar" style={{ width: lead.width, backgroundColor: lead.color }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-5 col-md-12 mt-2">
              <FollowUp schedule={[]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
