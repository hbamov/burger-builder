import React from "react";
import BurgerIngredient from './BurgerIngredient/BurgerIngredient'
import classes from './Burger.module.css'

const burger = (props) => {
    let transformedIngredients = Object.keys(props.ingredients)
        .map(igKey => {
            return [...Array(props.ingredients[igKey])].map((_, index) => {
                return <BurgerIngredient type={igKey} key={igKey + index}/>
            })
        });

    let ingredientsAmount = Object.values(props.ingredients)
        .reduce((a, b) => a + b, 0);

    if(ingredientsAmount === 0) {
        transformedIngredients = <p>Please Start Adding Ingredients</p>
    }

    Object.keys(props.ingredients)
        .map(igKey => {
            return [...Array(props.ingredients[igKey])].map((_, index) => {
                return <BurgerIngredient type={igKey} key={igKey + index}/>
            })
        });

    return (
        <div className={classes.Burger}>
            <BurgerIngredient type="bread-top" />
            {
                transformedIngredients
            }
            <BurgerIngredient type="bread-bottom" />
        </div>
    );
}

export default burger