import "./dashboard.css"
function Cards() {
  return (
    <div className="cards-row">

      <div className="stat-card to-collect">
        <p>To Collect</p>
        <h3>₹ 0</h3>
      </div>

      <div className="stat-card to-pay">
        <p>To Pay</p>
        <h3>₹ 0</h3>
      </div>

      <div className="stat-card cash-bank">
        <p>Total Cash + Bank Balance</p>
        <h3>₹ 0</h3>
      </div>

    </div>
  );
}

export default Cards;
