import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { Context } from "../../main";
import { useNavigate, Link } from "react-router-dom";

const MyJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [editingMode, setEditingMode] = useState(null);
  const { isAuthorized, user } = useContext(Context);
  const [starColors, setStarColors] = useState({});
  const [applicantCounts, setApplicantCounts] = useState({});

  const navigateTo = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/v1/job/getmyjobs",
          { withCredentials: true }
        );
        setMyJobs(data.myJobs);

        const initialStarColors = {};
        const applicantCountPromises = data.myJobs.map(async (job) => {
          initialStarColors[job._id] = "gold";
          const countRes = await axios.get(
            `http://localhost:5000/api/v1/application/count/${job._id}`,
            { withCredentials: true }
          );
          return { jobId: job._id, count: countRes.data.applicationCount };
        });

        const counts = await Promise.all(applicantCountPromises);
        const countsMap = counts.reduce((acc, { jobId, count }) => {
          acc[jobId] = count;
          return acc;
        }, {});

        setStarColors(initialStarColors);
        setApplicantCounts(countsMap);
      } catch (error) {
        toast.error(error.response.data.message);
        setMyJobs([]);
      }
    };
    fetchJobs();
  }, []);

  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/");
  }

  const handleEnableEdit = (jobId) => {
    setEditingMode(jobId);
  };

  const handleDisableEdit = () => {
    setEditingMode(null);
  };

  const handleUpdateJob = async (jobId) => {
    const updatedJob = myJobs.find((job) => job._id === jobId);
    await axios
      .put(`http://localhost:5000/api/v1/job/update/${jobId}`, updatedJob, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setEditingMode(null);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const handleDeleteJob = async (jobId) => {
    await axios
      .delete(`http://localhost:5000/api/v1/job/delete/${jobId}`, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setMyJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
        setStarColors((prevColors) => {
          const newColors = { ...prevColors };
          delete newColors[jobId];
          return newColors;
        });
        setApplicantCounts((prevCounts) => {
          const newCounts = { ...prevCounts };
          delete newCounts[jobId];
          return newCounts;
        });
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const handleInputChange = (jobId, field, value) => {
    setMyJobs((prevJobs) =>
      prevJobs.map((job) =>
        job._id === jobId ? { ...job, [field]: value } : job
      )
    );
  };

  const handleStarClick = (jobId) => {
    if (editingMode === jobId) {
      setStarColors((prevColors) => ({
        ...prevColors,
        [jobId]: prevColors[jobId] === "gold" ? "green" : "gold",
      }));
    }
  };

  return (
    <>
      <div className="myJobs page">
        <div className="container">
        <h1 style={{
          background: "linear-gradient(to right, #ff7e5f, #feb47b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
          padding: "10px",
          fontSize: "4em",
          textAlign: "center"
        }}>Your Posted Jobs</h1>
          {myJobs.length > 0 ? (
            <>
              <div className="banner">
                {myJobs.map((element) => (
                  <div className="card" key={element._id}>
                    <div className="content">
                      <div className="short_fields">
                        <div>
                          <span><bold>Title:</bold></span>
                          <input
                            type="text"
                            disabled={editingMode !== element._id}
                            value={element.title}
                            onChange={(e) =>
                              handleInputChange(
                                element._id,
                                "title",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <span>Country:</span>
                          <input
                            type="text"
                            disabled={editingMode !== element._id}
                            value={element.country}
                            onChange={(e) =>
                              handleInputChange(
                                element._id,
                                "country",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <span>City:</span>
                          <input
                            type="text"
                            disabled={editingMode !== element._id}
                            value={element.city}
                            onChange={(e) =>
                              handleInputChange(
                                element._id,
                                "city",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <span>Category:</span>
                          <select
                            value={element.category}
                            onChange={(e) =>
                              handleInputChange(
                                element._id,
                                "category",
                                e.target.value
                              )
                            }
                            disabled={editingMode !== element._id}
                          >
                            <option value="Graphics & Design">
                              Graphics & Design
                            </option>
                            <option value="Mobile App Development">
                              Mobile App Development
                            </option>
                            <option value="Frontend Web Development">
                              Frontend Web Development
                            </option>
                            <option value="MERN Stack Development">
                              MERN STACK Development
                            </option>
                            <option value="Account & Finance">
                              Account & Finance
                            </option>
                            <option value="Artificial Intelligence">
                              Artificial Intelligence
                            </option>
                            <option value="Video Animation">
                              Video Animation
                            </option>
                            <option value="MEAN Stack Development">
                              MEAN STACK Development
                            </option>
                            <option value="MEVN Stack Development">
                              MEVN STACK Development
                            </option>
                            <option value="Data Entry Operator">
                              Data Entry Operator
                            </option>
                          </select>
                        </div>
                        <div>
                          <span>
                            Salary:{" "}
                            {element.fixedSalary ? (
                              <input
                                type="number"
                                disabled={editingMode !== element._id}
                                value={element.fixedSalary}
                                onChange={(e) =>
                                  handleInputChange(
                                    element._id,
                                    "fixedSalary",
                                    e.target.value
                                  )
                                }
                              />
                            ) : (
                              <div>
                                <input
                                  type="number"
                                  disabled={editingMode !== element._id}
                                  value={element.salaryFrom}
                                  onChange={(e) =>
                                    handleInputChange(
                                      element._id,
                                      "salaryFrom",
                                      e.target.value
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  disabled={editingMode !== element._id}
                                  value={element.salaryTo}
                                  onChange={(e) =>
                                    handleInputChange(
                                      element._id,
                                      "salaryTo",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            )}
                          </span>
                        </div>
                        <div>
                          <span>Featured Company</span>
                          <div
                            className="star"
                            style={{ backgroundColor: starColors[element._id] }}
                            onClick={() => handleStarClick(element._id)}
                          ></div>
                        </div>
                        <div>
                          <span>Expired:</span>
                          <select
                            value={element.expired}
                            onChange={(e) =>
                              handleInputChange(
                                element._id,
                                "expired",
                                e.target.value
                              )
                            }
                            disabled={editingMode !== element._id}
                          >
                            <option value={true}>TRUE</option>
                            <option value={false}>FALSE</option>
                          </select>
                        </div>
                      </div>
                      <div className="long_field">
                        <div>
                          <span>Description:</span>{" "}
                          <textarea
                            rows={5}
                            value={element.description}
                            disabled={editingMode !== element._id}
                            onChange={(e) =>
                              handleInputChange(
                                element._id,
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <span>Location: </span>
                          <textarea
                            value={element.location}
                            rows={5}
                            disabled={editingMode !== element._id}
                            onChange={(e) =>
                              handleInputChange(
                                element._id,
                                "location",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="button_wrapper">
                      <div className="edit_btn_wrapper">
                        {editingMode === element._id ? (
                          <>
                            <button
                              onClick={() => handleUpdateJob(element._id)}
                              className="check_btn"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleDisableEdit()}
                              className="cross_btn"
                            >
                              <RxCross2 />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEnableEdit(element._id)}
                            className="edit_btn"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteJob(element._id)}
                        className="delete_btn"
                      >
                        Delete
                      </button>

                      <Link to={`/job/applicant/${element._id}`}>
                        <button className="applicant_count_btn">
                          Applicants: {applicantCounts[element._id] || 0}
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>
              You've not posted any job or may be you deleted all of your jobs!
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default MyJobs;
