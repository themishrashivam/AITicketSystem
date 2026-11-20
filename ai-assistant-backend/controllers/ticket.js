import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const newTicket = await Ticket.create({
      title: title.trim(),
      description: description.trim(),
      createdBy: req.user._id,
    });

    // Non-blocking: Inngest failure must never break ticket creation
    inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title: newTicket.title,
        description: newTicket.description,
        createdBy: req.user._id.toString(),
      },
    }).catch((err) => console.error("⚠️ Inngest send failed (non-fatal):", err.message));

    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (err) {
    console.error("❌ Error creating ticket:", err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;

    let tickets;

    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({
        createdBy: user._id,
      })
        .select(
          "title description status priority relatedSkills createdAt assignedTo"
        )
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      tickets,
    });
  } catch (error) {
    console.error("❌ Error fetching tickets:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;

    let ticket;

    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id)
        .populate("createdBy", ["email", "_id"])
        .populate("assignedTo", ["email", "_id"]);
    } else {
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id,
      })
        .select(
          "title description status priority helpfulNotes relatedSkills createdAt assignedTo createdBy"
        )
        .populate("assignedTo", ["email", "_id"]);
    }

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    console.error("❌ Error fetching ticket:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};