import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .send(
        "service_jetl37b",
        "template_hwysgwx",
        formData,
        "LuIbDb4IQTq6QKYGp"
      )
      .then(

        (response) => {
          setSuccessMessage("Message sent successfully!");
          setFormData({ name: "", email: "", message: "" }); // Clear form
        },
        (error) => {
          setSuccessMessage("Failed to send message. Please try again.");
          console.error("EmailJS Error:", error);

        }

      );
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px", border: "1px solid #ddd", borderRadius: "10px" }}>
      <h2>Contact Us</h2>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: "100%", padding: "8px", margin: "5px 0" }} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: "100%", padding: "8px", margin: "5px 0" }} />
        </div>
        <div>
          <label>Message:</label>
          <textarea name="message" value={formData.message} onChange={handleChange} required style={{ width: "100%", padding: "8px", margin: "5px 0" }} />
        </div>
        <button type="submit" style={{ padding: "10px", backgroundColor: "blue", color: "white", border: "none", cursor: "pointer" }}>
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactUs;