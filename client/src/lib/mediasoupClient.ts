import io from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

let device;
let producerTransport;
let consumerTransport;
let producers = {}; // tracks all producers in the room

// --------------------------------------------------
// INIT DEVICE
// --------------------------------------------------
export async function loadDevice(routerRtpCapabilities) {
  try {
    device = new mediasoupClient.Device();
    await device.load({ routerRtpCapabilities });
    return device;
  } catch (err) {
    console.error("Error loading device", err);
  }
}

// --------------------------------------------------
// CREATE PRODUCER TRANSPORT (streamer)
// --------------------------------------------------
export async function createProducerTransport(streamId) {
  return new Promise((resolve) => {
    socket.emit("createProducerTransport", { streamId }, async (params) => {
      producerTransport = device.createSendTransport(params);

      producerTransport.on("connect", ({ dtlsParameters }, callback) => {
        socket.emit("connectProducerTransport", { dtlsParameters, streamId }, callback);
      });

      producerTransport.on("produce", ({ kind, rtpParameters }, callback) => {
        socket.emit("produce", { kind, rtpParameters, streamId }, ({ id }) => {
          callback({ id });
        });
      });

      resolve(producerTransport);
    });
  });
}

// --------------------------------------------------
// CREATE CONSUMER TRANSPORT (viewer)
// --------------------------------------------------
export async function createConsumerTransport(streamId) {
  return new Promise((resolve) => {
    socket.emit("createConsumerTransport", { streamId }, async (params) => {
      consumerTransport = device.createRecvTransport(params);

      consumerTransport.on("connect", ({ dtlsParameters }, callback) => {
        socket.emit("connectConsumerTransport", { dtlsParameters, streamId }, callback);
      });

      resolve(consumerTransport);
    });
  });
}

// --------------------------------------------------
// CONSUME A PRODUCER
// --------------------------------------------------
export async function consumeTrack(streamId) {
  return new Promise((resolve) => {
    socket.emit("consume", { streamId, rtpCapabilities: device.rtpCapabilities }, async (params) => {
      if (params.error) {
        console.error("Cannot consume:", params.error);
        return;
      }

      const consumer = await consumerTransport.consume({
        id: params.id,
        producerId: params.producerId,
        kind: params.kind,
        rtpParameters: params.rtpParameters,
      });

      resolve(consumer);
    });
  });
}

// --------------------------------------------------
// JOIN ROOM
// --------------------------------------------------
export function joinRoom(streamId, isStreamer = false) {
  socket.emit("joinRoom", { streamId, isStreamer });
}

export { socket };
