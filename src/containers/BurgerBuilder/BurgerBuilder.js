import React from "react";
import Aux from "../../hoc/Aux/Aux"
import Burger from '../../components/Burger/Burger'
import BuildControls from '../../components/Burger/BuildControls/BuildControls'
import Modal from '../../components/UI/Modal/Modal'
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary'
import Spinner from '../../components/UI/Spinner/Spinner'
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler'

import axios from '../../axios-orders'

const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
}

class BurgerBuilder extends React.Component {
    state = {
        ingredients: null,
        totalPrice: 4,
        purchasable: false,
        purchasing: false,
        loading: false,
        error: false
    }

    componentDidMount() {
        axios.get('/ingredients.json')
            .then(response => {
                this.setState({
                    ingredients: response.data
                })
            })
            .catch(error => {
                this.setState({
                    error: true
                })
            })
    }

    updatePurchaseState (updatedIngredients) {
        const ingredientsSum = Object.values(updatedIngredients)
            .reduce((a, b) => a + b);

        this.setState({
            purchasable: ingredientsSum > 0
        })
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedIngredients = {
            ...this.state.ingredients
        }

        updatedIngredients[type] = oldCount + 1;

        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;

        this.setState({
            ingredients: updatedIngredients,
            totalPrice: oldPrice + priceAddition
        })

        this.updatePurchaseState(updatedIngredients);
    }

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];

        if(oldCount === 0) {
            return;
        }

        const updatedIngredients = {
            ...this.state.ingredients
        }

        updatedIngredients[type] = oldCount - 1;

        const priceDeduction = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;

        this.setState({
            ingredients: updatedIngredients,
            totalPrice: oldPrice - priceDeduction
        })

        this.updatePurchaseState(updatedIngredients);
    }

    purchaseHandler = () => {
        this.setState({
            purchasing: true
        });
    }

    purchaseCancelHandler = () => {
        this.setState({
            purchasing: false
        })
    }

    purchaseContinueHandler = () => {
        const queryParams = [];
        for(let index in this.state.ingredients) {
            queryParams.push(
                encodeURIComponent(index) + '=' + encodeURIComponent(this.state.ingredients[index])
            )
        }

        queryParams.push('price=' + this.state.totalPrice);

        const queryString = queryParams.join('&');

        this.props.history.push({
            pathname: '/checkout',
            search: '?' + queryString
        })
    }

    render() {
        const disabledInfo = {
            ...this.state.ingredients
        }

        for(let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] === 0
        }

        let orderSummary = null;
        let burger = this.state.error ? <p>Ingredients cant be loaded</p> : <Spinner/>

        if(this.state.ingredients) {
            burger = (
                <Aux>
                    <Burger ingredients={this.state.ingredients}/>
                    <BuildControls
                        ingredientAdded={this.addIngredientHandler}
                        ingredientRemoved={this.removeIngredientHandler}
                        disabled={disabledInfo}
                        purchasable={this.state.purchasable}
                        ordered={this.purchaseHandler}
                        price={this.state.totalPrice}
                    />
                </Aux>
            )

            orderSummary = <OrderSummary
                ingredients={this.state.ingredients}
                purchaseCanceled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler}
                price={this.state.totalPrice}
            />;
        }

        if(this.state.loading === true) {
            orderSummary = <Spinner/>
        }

        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {
                        orderSummary
                    }
                </Modal>
                {
                    burger
                }

            </Aux>
        )
    }
}

export default withErrorHandler(BurgerBuilder, axios)