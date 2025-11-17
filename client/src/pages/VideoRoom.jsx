import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { io } from "socket.io-client";
import api from "../api/axios";
import { toast } from "react-toastify";
import { AlertTriangle } from "lucide-react";
import Editor from "@monaco-editor/react";

const SOCKET_URL = "http://localhost:5000";

const VideoRoom = () => {
  const { id } = useParams(); // meetingId (route param)
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const socketRef = useRef(null);
  const editorDebounceRef = useRef(null);
  // Coin reward animation

  const [meeting, setMeeting] = useState(null);
  const [isInterviewer, setIsInterviewer] = useState(false);
  const [meetingNotFound, setMeetingNotFound] = useState(false);

  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [code, setCode] = useState("// Start typing code...");

  // End meeting modal + flow
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // No-show handling
  const [showNoShowPopup, setShowNoShowPopup] = useState(false);
  const [userJoinedTracked, setUserJoinedTracked] = useState(false);

  // -----------------------------
  // Single socket connection (created after meeting is loaded)
  // -----------------------------
  useEffect(() => {
    // Don't connect until we have meeting data and token
    if (!token) {
      toast.error("Authentication required. Please sign in.");
      navigate("/");
      return;
    }

    if (!meeting) return;

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = s;

    s.on("connect", () => {
      // socket connected
      s.emit("joinVideoRoom", id);
    });

    // server emits when interviewer ends meeting
    s.on("meetingEnded", (data) => {
      // Always notify users that the meeting ended. Interviewees go to review,
      // interviewers are taken back to home (show reward state).
      toast.info("The meeting has ended.");
      if (isInterviewer) {
        navigate("/home", { state: { showReward: true } });
      } else {
        navigate(`/review/${id}`);
      }
    });

    // realtime flag when interviewer starts
    s.on("interviewerStartedUpdate", ({ meetingId }) => {
      if (meetingId === id) {
        setMeeting((prev) =>
          prev ? { ...prev, interviewerStarted: true } : prev
        );
      }
    });

    // code sync listener
    s.on("codeUpdate", ({ meetingId, code: newCode }) => {
      if (meetingId === id) {
        setCode(newCode ?? "");
      }
    });

    s.on("disconnect", (reason) => {
      // socket disconnected
    });

    s.on("error", (err) => {
      // socket error
    });

    return () => {
      try {
        s.disconnect();
      } catch (e) {
        /* ignore */
      }
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, meeting, token]); // run once per meeting id when meeting data available

  // -----------------------------
  // 1) Fetch meeting & detect role
  // -----------------------------
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await api.get(`/interviewerprofile/meeting/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meetingData = res.data.meeting;
        if (!meetingData) {
          toast.error("No upcoming meeting found for this ID.");
          setMeetingNotFound(true);
          return;
        }
        setMeeting(meetingData);

        const interviewerId =
          meetingData?.interviewerId?.userId?._id ||
          meetingData?.interviewerId?._id;

        setIsInterviewer(currentUserId === interviewerId);
      } catch (err) {
        toast.error("Failed to load meeting details.");
      }
    };

    fetchMeeting();
  }, [id, token, currentUserId]);

  // ---------------------------------------------------------
  // 2) Track that this user joined the room (server-side)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!meeting || userJoinedTracked) return;

    const track = async () => {
      try {
        await api.post(
          `/interviewer/meeting/${id}/user-joined`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserJoinedTracked(true);
      } catch (err) {}
    };

    track();
  }, [meeting, id, token, userJoinedTracked]);

  // ---------------------------------------------------------
  // 3) If current user is interviewer, mark meeting started
  //    and emit realtime update for interviewee
  // ---------------------------------------------------------
  useEffect(() => {
    if (!meeting || !isInterviewer) return;
    if (meeting.interviewerStarted) return; // <-- prevent repeat calls

    const startMeeting = async () => {
      try {
        await api.post(
          `/interviewer/meeting-started/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {}
    };

    startMeeting();
  }, [meeting, isInterviewer]);

  const handleInterviewerNoShow = async () => {
    try {
      await api.post(
        `/interview/no-show/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Ask interviewee for new time slot
      navigate(`/reschedule/${id}`);
    } catch (err) {}
  };

  // ---------------------------------------------------------
  // 4) No-show logic (10 minutes) for interviewee
  // ---------------------------------------------------------
  useEffect(() => {
    if (!meeting || isInterviewer) return;

    const meetingTime = new Date(meeting.timeSlot).getTime();
    const now = Date.now();
    const diffMinutes = (now - meetingTime) / (1000 * 60);

    const interviewerJoined = meeting.startedUsers?.includes(
      meeting.interviewerId?.userId?._id || meeting.interviewerId?._id
    );

    if (!interviewerJoined && diffMinutes >= 15) {
      handleInterviewerNoShow();
    }
  }, [meeting, isInterviewer]);

  // ---------------------------------------------------------
  // 5) End meeting (Interviewer only)
  // ---------------------------------------------------------
  const handleEndMeeting = async () => {
    if (!isInterviewer) return;

    try {
      setIsEnding(true);

      const res = await api.post(
        `/video/interview/complete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Meeting ended successfully");
      // interviewer who ended the meeting goes back to home and sees reward UI
      navigate("/home", { state: { showReward: true } });
    } catch (err) {
      toast.error("Failed to end meeting");
    } finally {
      setIsEnding(false);
      setShowConfirmEnd(false);
    }
  };

  // ---------------------------------------------------------
  // Editor: debounced send
  // ---------------------------------------------------------
  const sendCodeUpdate = (newCode) => {
    // debounce quick edits
    if (editorDebounceRef.current) clearTimeout(editorDebounceRef.current);
    editorDebounceRef.current = setTimeout(() => {
      socketRef.current?.emit("codeUpdate", { meetingId: id, code: newCode });
    }, 250); // 250ms debounce
  };

  // when editor value changed locally
  const onEditorChange = (value) => {
    setCode(value ?? "");
    sendCodeUpdate(value ?? "");
  };

  // ---------------------------------------------------------
  // onReadyToClose: control behavior when user clicks Jitsi hangup
  // ---------------------------------------------------------
  const onJitsiReadyToClose = () => {
    if (isInterviewer) {
      // show confirm modal to end meeting
      setShowConfirmEnd(true);
    } else {
      // interviewee should go to review screen — but interviewer must complete on backend first.
      toast.info("Please wait for the interviewer to end the meeting.");
      // optionally navigate to review only when server emits meetingEnded
    }
  };

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  if (meetingNotFound) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center max-w-xl">
          <h2 className="text-2xl font-semibold text-slate-100 mb-2">
            No upcoming meeting found
          </h2>
          <p className="text-slate-400 mb-6">
            We couldn't find a scheduled meeting for this link. It may have been
            cancelled or the ID is incorrect.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate("/home")}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate("/reschedule")}
              className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg"
            >
              Reschedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative">
      <h1 className="text-2xl font-bold text-cyan-400 mb-4">Interview Room</h1>

      <div className="w-full max-w-6xl h-[80vh] bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg relative">
        <JitsiMeeting
          roomName={id}
          // domain="127.0.0.1:8443"
          domain="meet.jit.si"
          userInfo={{
            displayName:
              currentUserId === meeting?.interviewerId?.userId?._id
                ? meeting?.intervieweeId?.userId?.firstName
                : meeting?.interviewerId?.userId?.firstName,
          }}
          configOverwrite={{
            prejoinPageEnabled: false,
            startWithAudioMuted: true,
            disableInviteFunctions: true,
          }}
          interfaceConfigOverwrite={{
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "desktop",
              "chat",
              "participants-pane",
              "tileview",
            ],
          }}
          onReadyToClose={onJitsiReadyToClose}
          getIFrameRef={(iframeRef) => {
            if (!iframeRef) return;
            iframeRef.style.height = "100%";
            iframeRef.style.width = "100%";
            iframeRef.style.borderRadius = "12px";
          }}
        />

        {/* End Interview button for interviewer */}
        {isInterviewer && (
          <button
            onClick={() => setShowConfirmEnd(true)}
            className="absolute bottom-4 right-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg shadow-lg hover:from-red-600 hover:to-pink-700 transition-all z-40"
          >
            End Interview
          </button>
        )}

        {/* Live Code Editor toggle - visible to both */}
        <button
          onClick={() => setShowEditor(true)}
          className="absolute bottom-4 left-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all z-40"
        >
          Live Code Editor
        </button>
      </div>

      {/* Confirm End Meeting Modal */}
      {showConfirmEnd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-xl text-center max-w-sm w-full">
            <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto" />
            <h3 className="text-lg text-slate-100 font-semibold mt-3">
              End this interview?
            </h3>
            <p className="text-slate-400 mt-2">
              Once ended, the interviewee will be redirected to submit review.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowConfirmEnd(false)}
                className="flex-1 bg-slate-700 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleEndMeeting}
                disabled={isEnding}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg"
              >
                {isEnding ? "Ending..." : "End Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No-show popup for interviewee */}

      {/* Live Code Editor modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 w-full max-w-6xl h-[80vh] rounded-xl overflow-hidden shadow-xl border border-slate-700 relative">
            <div className="flex items-center justify-between p-3 border-b border-slate-700">
              <div className="text-slate-200 font-semibold">
                Live Collaborative Editor
              </div>
              <div className="flex items-center gap-2">
                <div className="text-slate-400 text-sm">
                  {isInterviewer ? "Interviewer" : "Interviewee"}
                </div>
                <button
                  onClick={() => setShowEditor(false)}
                  className="bg-slate-700 text-white px-3 py-1 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>

            <Editor
              height="calc(100% - 48px)"
              defaultLanguage="javascript"
              value={code}
              onChange={onEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoRoom;
