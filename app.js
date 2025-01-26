// Get all the HTML elements we need
const addRecipeButton = document.getElementById('addRecipeBtn');
const recipeModal = document.getElementById('addRecipeModal');
const recipeForm = document.getElementById('recipeForm');
const recipeList = document.getElementById('recipes');
const categoryDropdown = document.getElementById('categoryFilter');

// Show the modal when "Add Recipe" is clicked
addRecipeButton.onclick = function() {
    recipeModal.style.display = 'block';
};

// Hide the modal when "Cancel" is clicked
const closeButtons = document.querySelectorAll('.closeModal');
closeButtons.forEach(function(button) {
    button.onclick = function() {
        recipeModal.style.display = 'none';
    };
});

// Add new ingredient fields when "Add Ingredient" is clicked
const addIngredientButton = document.getElementById('addIngredient');
addIngredientButton.onclick = function() {
    const ingredientsSection = document.getElementById('ingredients');
    
    // Create a new ingredient row
    const newRow = document.createElement('div');
    newRow.className = 'ingredient-entry';
    
    // Add all the fields needed for an ingredient
    newRow.innerHTML = `
        <input type="number" step="0.25" placeholder="Amount">
        <select class="unit">
            <option value="unit">Unit</option>
            <option value="g">grams</option>
            <option value="ml">ml</option>
            <option value="tbsp">tbsp</option>
            <option value="tsp">tsp</option>
        </select>
        <input type="text" placeholder="Ingredient">
        <select class="section">
            <option value="produce">Fresh Produce</option>
            <option value="canned">Canned Goods</option>
            <option value="dried">Dried Foods</option>
        </select>
        <button type="button" class="removeIngredient">×</button>
    `;
    
    // Add the new row to the form
    ingredientsSection.appendChild(newRow);
    
    // Make the remove button work
    const removeButton = newRow.querySelector('.removeIngredient');
    removeButton.onclick = function() {
        newRow.remove();
    };
};

// Save recipe to Firebase when form is submitted
recipeForm.onsubmit = async function(event) {
    // Prevent the form from actually submitting
    event.preventDefault();
    
    // Get the recipe name
    const recipeName = document.getElementById('recipeName').value;
    
    // Get all selected categories
    const selectedCategories = [];
    const categoryCheckboxes = document.querySelectorAll('.checkbox-group input:checked');
    categoryCheckboxes.forEach(function(checkbox) {
        selectedCategories.push(checkbox.value);
    });
    
    // Get all ingredients
    const ingredients = [];
    const ingredientRows = document.querySelectorAll('.ingredient-entry');
    ingredientRows.forEach(function(row) {
        ingredients.push({
            amount: row.querySelector('input[type="number"]').value,
            unit: row.querySelector('.unit').value,
            name: row.querySelector('input[type="text"]').value,
            section: row.querySelector('.section').value
        });
    });
    
    // Create the recipe object
    const recipe = {
        name: recipeName,
        categories: selectedCategories,
        ingredients: ingredients,
        dateAdded: new Date()
    };
    
    try {
        // Save to Firebase
        const db = firebase.firestore();
        await db.collection('recipes').add(recipe);
        
        // Clear the form and hide the modal
        recipeForm.reset();
        recipeModal.style.display = 'none';
        
        // Reload the recipes list
        loadRecipes();
    } catch (error) {
        alert('Error saving recipe: ' + error.message);
    }
};

// Load and display all recipes
async function loadRecipes() {
    try {
        const db = firebase.firestore();
        const recipes = await db.collection('recipes').get();
        
        // Clear the current list
        recipeList.innerHTML = '';
        
        // Add each recipe to the page
        recipes.forEach(function(doc) {
            const recipe = doc.data();
            const recipeId = doc.id;
            
            // Create a card for the recipe
            const card = document.createElement('div');
            card.className = 'recipe-card';
            
            // Add the recipe content
            card.innerHTML = `
                <h3>${recipe.name}</h3>
                <div class="categories">
                    ${recipe.categories.map(cat => `<span>${cat}</span>`).join('')}
                </div>
                <h4>Ingredients:</h4>
                <ul>
                    ${recipe.ingredients.map(ing => 
                        `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`
                    ).join('')}
                </ul>
                <button class="delete-recipe">Delete</button>
                <button class="add-to-week">Add to Week</button>
            `;
            
            // Make the delete button work
            const deleteButton = card.querySelector('.delete-recipe');
            deleteButton.onclick = async function() {
                if (confirm('Are you sure you want to delete this recipe?')) {
                    try {
                        await db.collection('recipes').doc(recipeId).delete();
                        loadRecipes();
                    } catch (error) {
                        alert('Error deleting recipe: ' + error.message);
                    }
                }
            };
            
            // Add the card to the page
            recipeList.appendChild(card);
        });
    } catch (error) {
        alert('Error loading recipes: ' + error.message);
    }
}

// Filter recipes when category is changed
categoryDropdown.onchange = async function() {
    const selectedCategory = categoryDropdown.value;
    
    try {
        const db = firebase.firestore();
        const recipes = await db.collection('recipes').get();
        
        // Clear the current list
        recipeList.innerHTML = '';
        
        // Add matching recipes to the page
        recipes.forEach(function(doc) {
            const recipe = doc.data();
            
            // Show all recipes or only those matching the selected category
            if (selectedCategory === 'all' || recipe.categories.includes(selectedCategory)) {
                const card = document.createElement('div');
                card.className = 'recipe-card';
                // (Same card creation code as in loadRecipes)
                // ...
                recipeList.appendChild(card);
            }
        });
    } catch (error) {
        alert('Error filtering recipes: ' + error.message);
    }
};

// Load recipes when the page loads
loadRecipes();