import { Server as SocketIOServer, Socket } from "socket.io";
import Activity from "../models/Activity"; // Make sure Activity model path is correct

export interface LocationUpdate {
  activityId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  elevation?: number;
}

export interface ActivityMetrics {
  activityId: string;
  distance?: number;
  duration?: number;
  calories?: number;
  speed?: number;
  heartRate?: number;
  steps?: number;
}

export const setupActivityHandlers = (io: SocketIOServer) => {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    // Join activity-specific room
    socket.on("join-activity", (activityId: string) => {
      if (activityId) {
        socket.join(`activity:${activityId}`);
        console.log(`Client ${socket.id} joined activity room: activity:${activityId}`);
      } else {
        console.error(`Client ${socket.id} tried to join activity with no ID.`);
      }
    });

    // Leave activity room
    socket.on("leave-activity", (activityId: string) => {
      if (activityId) {
        socket.leave(`activity:${activityId}`);
        console.log(`Client ${socket.id} left activity room: activity:${activityId}`);
      }
    });

    // Handle real-time location tracking data
    socket.on("location-update", async (data: LocationUpdate) => {
      try {
        const { activityId, ...locationPoint } = data;
        if (!activityId) {
          socket.emit("error", { message: "Activity ID is required for location update." });
          return;
        }
        // In a real app, you'd likely want to validate the user owns this activity
        await Activity.findByIdAndUpdate(activityId, {
          $push: { path: locationPoint },
          // $set: { lastLocation: locationPoint } // 'lastLocation' is not in the IActivity schema, consider adding it or removing this line.
        });
        io.to(`activity:${activityId}`).emit("activity-location-update", { activityId, location: locationPoint });
      } catch (error) {
        console.error("Error handling location update:", error);
        socket.emit("error", { message: "Failed to process location update." });
      }
    });

    // Handle real-time metrics updates
    socket.on("metrics-update", async (data: ActivityMetrics) => {
      try {
        const { activityId, ...metrics } = data;
         if (!activityId) {
          socket.emit("error", { message: "Activity ID is required for metrics update." });
          return;
        }
        // In a real app, you'd likely want to validate the user owns this activity
        await Activity.findByIdAndUpdate(activityId, { $set: metrics });
        io.to(`activity:${activityId}`).emit("activity-metrics-update", { activityId, metrics });
      } catch (error) {
        console.error("Error handling metrics update:", error);
        socket.emit("error", { message: "Failed to process metrics update." });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // Consider any cleanup needed, e.g., leaving rooms if not handled by client
    });
  });
};
