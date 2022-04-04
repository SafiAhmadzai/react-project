import React, { useState } from "react";

import "./ExpenseForm.css";

const ExpenseForm = () => {
  const [enterTitle, setEnterTitle] = useState("");
  const [enterAmount, setEnteredAmount] = useState("");
  const [enterDate, setEnteredDate] = useState("");

  const handleClick = (event) => {
    setEnterTitle(event.target.value);
  };
  const handleAmount = (event) => {
    setEnteredAmount(event.target.value);
  };

  const handleDate = (event) => {
    setEnteredDate(event.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const expensData = {
      title: enterTitle,
      amount: enterAmount,
      date: new Date(enterDate),
    };
    console.log(expensData);
    setEnterTitle("");
    setEnteredAmount("");
    setEnteredDate("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="new-expense__controls">
        <div className="new-expense__control">
          <label>Title</label>
          <input type="text" value={enterTitle} onChange={handleClick} />
        </div>
        <div className="new-expense__control">
          <label>Amount</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={enterAmount}
            onChange={handleAmount}
          />
        </div>
        <div className="new-expense__control">
          <label>Date</label>
          <input
            type="date"
            min="2019-01-01"
            max="2022-12-31"
            value={enterDate}
            onChange={handleDate}
          />
        </div>
      </div>
      <div className="new-expense__actions">
        <button type="submit">Add Expense</button>
      </div>
    </form>
  );
};

export default ExpenseForm;
