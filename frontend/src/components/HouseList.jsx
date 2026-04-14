import React from "react";

const HouseList = ({ houses, onEdit, onDelete }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      {houses.map((house) => (
        <div
          key={house._id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "15px",
            boxShadow: "0 0 5px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src={house.image}
            alt={house.location || "house"}
            style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }}
          />
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {house.location}
            {house.isVerified && (
              <span
                style={{
                  background: "green",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                ✔ Verified Agent
              </span>
            )}
          </h3>
          <p>Bedrooms: {house.bedrooms}</p>
          <p>Price: ₦{Number(house.price).toLocaleString()}</p>

          <div style={{ marginTop: "10px" }}>
            <button
              onClick={() => onEdit(house)}
              style={{
                background: "#2563eb",
                color: "white",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(house._id)}
              style={{
                background: "red",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HouseList;
