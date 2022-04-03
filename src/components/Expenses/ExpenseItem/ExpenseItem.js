import { useState } from "react";
import Card from "../../UI/Card";
import ExpenseDate from "../ExpenseDate/ExpenseDate";
import "./ExpenseItem.css";

const ExpenseItem = (props) => {
  const [title, setTitle] = useState(props.title);

  const handleClick = () => {
    setTitle("Updated!!");
    console.log(title);
  };

  return (
    <Card className="expense-item">
      <ExpenseDate date={props.date}></ExpenseDate>
      <div className="expense-item__description">
        <h2>{title}</h2>
        <div className="expense-item__price">{props.amount}</div>
      </div>
      <button className="expense-item__price" onClick={handleClick}>
        Change Title
      </button>
    </Card>
  );
};

export default ExpenseItem;
