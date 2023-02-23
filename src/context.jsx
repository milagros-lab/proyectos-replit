import React, { useContext, useEffect, useState } from 'react';
const AppContext = React.createContext();
import axios from 'axios'

const ALL_MEAL_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s='
const RAMDOM_MEAL_URL = 'https://www.themealdb.com/api/json/v1/1/random.php'

const getFavoritesFromLocalStorage = () => {
  const favorites = localStorage.getItem('favorites')

  return favorites ? JSON.parse(favorites) : []
}

const AppProvider = ({ children }) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [favorites, setFavorites] = useState(getFavoritesFromLocalStorage())

  const fetchMeals = async (url) => {
    setLoading(true)
    try {
      const { data } = await axios(url);
      if (data.meals) {
        setMeals(data.meals)
      }
      else {
        setMeals([])
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false)
  };

  const fetchRandomMeal = () => {
    fetchMeals(RAMDOM_MEAL_URL)
  }

  const selectMeal = (idMeal, favoriteMeal) => {
    let result;
    if (favoriteMeal) {
      result = favorites.find((mealFavorite) => mealFavorite.idMeal === idMeal)
    }
    else {
      result = meals.find((meal) => meal.idMeal === idMeal)
    }
    setSelectedMeal(result);
    setShowModal(true)
  };

  const closeModal = () => {
    setShowModal(false)
  }

  const addToFavorites = (idMeal) => {
    const meal = meals.find((meal) => meal.idMeal === idMeal)

    const alreadyFavorite = favorites.find((meal) => meal.idMeal === idMeal)

    if (alreadyFavorite) return

    const updatedFavorites = [...favorites, meal]

    setFavorites(updatedFavorites)

    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
  }

  const removeFromFavorites = (idMeal) => {
    const updatedFavorites = favorites.filter((meal) => meal.idMeal !== idMeal);

    setFavorites(updatedFavorites)

    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
  }

  useEffect(() => {
    fetchMeals(ALL_MEAL_URL)
  }, [])

  useEffect(() => {
    if (!searchTerm) return
    fetchMeals(`${ALL_MEAL_URL}${searchTerm}`)
  }, [searchTerm])

  return <AppContext.Provider value={{ loading, meals, setSearchTerm, fetchRandomMeal, showModal, selectMeal, selectedMeal, closeModal, addToFavorites, removeFromFavorites, favorites }}>
    {children}
  </AppContext.Provider>
};

export const useGlobalContext = () => {
  return useContext(AppContext)
};

export { AppContext, AppProvider };