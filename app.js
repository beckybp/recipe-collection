// Get all the elements we need
const addRecipeButton = document.getElementById('addRecipeBtn');
const recipeModal = document.getElementById('addRecipeModal');
const recipeForm = document.getElementById('recipeForm');
const recipeList = document.getElementById('recipes');
const selectedRecipesContainer = document.getElementById('selectedRecipes');

// Arrays to store our recipes
let recipes = [];
let weeklyRecipes = [];

// When "Add Recipe" button is clicked, show the form
addRecipeButton.onclick = function() {
    // Show the modal
    recipeModal.classList.add('show');
    
    // Create the form content
    const formContent = `
        <input type="text" id="recipeName" placeholder="Recipe Name" required>
        <input type="text" id="recipeUrl" placeholder="Recipe URL">
        <input type="text" id="imageUrl" placeholder="Image URL">
        <input type="number" id="servings" placeholder="Number of Servings" required>
        
        <div class="categories">
            <label>Categories:</label>
            <div class="checkbox-group">
                <input type="checkbox" id="quickEasy" value="quick">
                <label for="quickEasy">Quick & Easy</label>
                
                <input type="checkbox" id="soups" value="soups">
                <label for="soups">Soups</label>
                
                <input type="checkbox" id="breakfast" value="breakfast">
                <label for="breakfast">Breakfast</label>
            </div>
        </div>

        <div id="ingredients">
            <h3>Ingredients</h3>
            <div class="ingredient-entry">
                <input type="text" placeholder="Ingredient">
                <input type="number" step="0.25" placeholder="Amount">
                <select class="unit">
                    <option value="unit">Unit</option>
                    <option value="g">grams</option>
                    <option value="ml">ml</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                </select>
                <select class="section">
                    <option value="produce">Fresh Produce</option>
                    <option value="canned">Canned Goods</option>
                    <option value="dried">Dried Foods</option>
                </select>
                <button type="button" class="removeIngredient">×</button>
            </div>
        </div>
        <button type="button" id="addIngredient">Add Ingredient</button>
        <button type="submit">Save Recipe</button>
        <button type="button" class="closeModal">Cancel</button>
    `;
    
    // Put the form content in the modal
    recipeForm.innerHTML = formContent;

    // Add cancel button functionality
    document.querySelector('.closeModal').onclick = function() {
        recipeModal.classList.remove('show');
        recipeForm.reset();  // Clear the form
    };

    // Set up the "Add Ingredient" button functionality
    document.getElementById('addIngredient').onclick = function() {
        // Create a new ingredient row
        const newRow = document.createElement('div');
        newRow.className = 'ingredient-entry';
        
        // Add the HTML for the new ingredient row
        newRow.innerHTML = `
            <input type="text" placeholder="Ingredient">
            <input type="number" step="0.25" placeholder="Amount">
            <select class="unit">
                <option value="unit">Unit</option>
                <option value="g">grams</option>
                <option value="ml">ml</option>
                <option value="tbsp">tbsp</option>
                <option value="tsp">tsp</option>
            </select>
            <select class="section">
                <option value="produce">Fresh Produce</option>
                <option value="canned">Canned Goods</option>
                <option value="dried">Dried Foods</option>
            </select>
            <button type="button" class="removeIngredient">×</button>
        `;
        
        // Make the remove button work
        newRow.querySelector('.removeIngredient').onclick = function() {
            newRow.remove();
        };
        
        // Add the new row to the form
        document.getElementById('ingredients').appendChild(newRow);
    };

    // Make all remove ingredient buttons work
    document.querySelectorAll('.removeIngredient').forEach(button => {
        button.onclick = function() {
            button.parentElement.remove();
        };
    });
};



// When the recipe form is submitted
recipeForm.onsubmit = function(event) {
    // Prevent the form from actually submitting
    event.preventDefault();
    
    // Create a recipe object with all the form data
    const recipe = {
        name: document.getElementById('recipeName').value,
        url: document.getElementById('recipeUrl').value,
        imageUrl: document.getElementById('imageUrl').value,
        servings: document.getElementById('servings').value,
        // Get all checked categories
        categories: Array.from(document.querySelectorAll('.checkbox-group input:checked')).map(cb => cb.value),
        // Get all ingredients
        ingredients: Array.from(document.querySelectorAll('.ingredient-entry')).map(row => ({
            name: row.querySelector('input[type="text"]').value,
            amount: row.querySelector('input[type="number"]').value,
            unit: row.querySelector('.unit').value,
            section: row.querySelector('.section').value
        }))
    };
    
    // Add the recipe to our list
    recipes.push(recipe);
    
    // Clear and hide the form
    recipeForm.reset();
    recipeModal.classList.remove('show');
    
    // Update the display
    showAllRecipes();
};

// Filter recipes when category is changed
document.getElementById('categoryFilter').onchange = function() {
    showAllRecipes(this.value);
};

// Show all recipes (or filtered recipes)
function showAllRecipes(filterCategory = 'all') {
    // Clear the current display
    recipeList.innerHTML = '';
    
    // Go through each recipe
    recipes.forEach((recipe, index) => {
        // Skip if it doesn't match the filter
        if (filterCategory !== 'all' && !recipe.categories.includes(filterCategory)) return;

        // Create a card for the recipe
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        // Add the recipe content
        card.innerHTML = `
            ${recipe.imageUrl ? `<img src="${recipe.imageUrl}" alt="${recipe.name}">` : ''}
            <h3>${recipe.url ? 
                `<a href="${recipe.url}" target="_blank">${recipe.name}</a>` : 
                recipe.name}
            </h3>
            <div class="recipe-info">
                <span>Servings: ${recipe.servings}</span>
                <div class="categories">
                    ${recipe.categories.map(cat => `<span>${cat}</span>`).join('')}
                </div>
            </div>
            <div class="recipe-buttons">
                <button class="edit-recipe">Edit</button>
                <button class="delete-recipe">Delete</button>
                <button class="add-to-week">Add to Week</button>
            </div>
        `;
        
        // Add delete button functionality
        card.querySelector('.delete-recipe').onclick = function() {
            if (confirm('Delete this recipe?')) {
                recipes.splice(index, 1);
                showAllRecipes(filterCategory);
            }
        };
        
        // Add edit button functionality
        card.querySelector('.edit-recipe').onclick = function() {
            // Show the modal
            recipeModal.classList.add('show');
            
            // Fill in the basic fields
            document.getElementById('recipeName').value = recipe.name;
            document.getElementById('recipeUrl').value = recipe.url;
            document.getElementById('imageUrl').value = recipe.imageUrl;
            document.getElementById('servings').value = recipe.servings;
            
            // Check the right categories
            document.querySelectorAll('.checkbox-group input').forEach(checkbox => {
                checkbox.checked = recipe.categories.includes(checkbox.value);
            });
            
            // Clear and recreate ingredient rows
            document.getElementById('ingredients').innerHTML = '';
            
            // Add each ingredient
            recipe.ingredients.forEach(ing => {
                const newRow = document.createElement('div');
                newRow.className = 'ingredient-entry';
                newRow.innerHTML = `
                    <input type="text" value="${ing.name}">
                    <input type="number" step="0.25" value="${ing.amount}">
                    <select class="unit">
                        <option value="unit">Unit</option>
                        <option value="g">grams</option>
                        <option value="ml">ml</option>
                        <option value="tbsp">tbsp</option>
                        <option value="tsp">tsp</option>
                    </select>
                    <select class="section">
                        <option value="produce">Fresh Produce</option>
                        <option value="canned">Canned Goods</option>
                        <option value="dried">Dried Foods</option>
                    </select>
                    <button type="button" class="removeIngredient">×</button>
                `;
                
                // Set the correct values
                newRow.querySelector('.unit').value = ing.unit;
                newRow.querySelector('.section').value = ing.section;
                
                // Make remove button work
                newRow.querySelector('.removeIngredient').onclick = function() {
                    newRow.remove();
                };
                
                document.getElementById('ingredients').appendChild(newRow);
            });
            
            // Remove the old recipe (new one will be added when form is submitted)
            recipes.splice(index, 1);
        };
        
        // Add to weekly plan functionality
        card.querySelector('.add-to-week').onclick = function() {
            weeklyRecipes.push(recipe);
            showWeeklyRecipes();
        };
        
        // Add the card to the page
        recipeList.appendChild(card);
    });
}

// Show recipes added to the week
function showWeeklyRecipes() {
    selectedRecipesContainer.innerHTML = '<h3>This Week\'s Recipes:</h3>';
    
    weeklyRecipes.forEach((recipe, index) => {
        const div = document.createElement('div');
        div.innerHTML = `
            ${recipe.name} 
            <button class="remove-recipe">Remove</button>
        `;
        
        // Make remove button work
        div.querySelector('.remove-recipe').onclick = function() {
            weeklyRecipes.splice(index, 1);
            showWeeklyRecipes();
        };
        
        selectedRecipesContainer.appendChild(div);
    });
}

// Generate shopping list when button is clicked
document.getElementById('generateList').onclick = function() {
    const shoppingDiv = document.getElementById('shoppingList');
    const listDiv = document.getElementById('organizedList');
    
    // Create object to store ingredients by section
    const sections = {
        produce: [],
        canned: [],
        dried: []
    };
    
    // Add up all ingredients from weekly recipes
    weeklyRecipes.forEach(recipe => {
        recipe.ingredients.forEach(ing => {
            // Look for existing ingredient in this section
            const existingIng = sections[ing.section].find(i => 
                i.name.toLowerCase() === ing.name.toLowerCase() && i.unit === ing.unit
            );
            
            if (existingIng) {
                // Add to existing ingredient
                existingIng.amount += Number(ing.amount);
            } else {
                // Add as new ingredient
                sections[ing.section].push({...ing, amount: Number(ing.amount)});
            }
        });
    });
    
    // Create the shopping list HTML
    listDiv.innerHTML = '';
    
    Object.keys(sections).forEach(section => {
        // Only show sections that have ingredients
        if (sections[section].length > 0) {
            listDiv.innerHTML += `
                <h3>${section}</h3>
                <ul>
                    ${sections[section].map(ing => 
                        `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`
                    ).join('')}
                </ul>
            `;
        }
    });
    
    // Show the shopping list
    shoppingDiv.classList.remove('hidden');

    document.getElementById('copyList').onclick = function() {
        const listDiv = document.getElementById('organizedList');
        
        // Create a plain text version of the shopping list
        let textList = '';
        
        // Get all sections
        const sections = listDiv.querySelectorAll('h3');
        sections.forEach(section => {
            textList += `\n${section.textContent}\n`;
            const items = section.nextElementSibling.querySelectorAll('li');
            items.forEach(item => {
                textList += `${item.textContent}\n`;
            });
        });
        
        // Copy to clipboard
        navigator.clipboard.writeText(textList)
            .then(() => alert('Shopping list copied!'))
            .catch(() => alert('Failed to copy list'));
    };
};

// Show initial display
showAllRecipes();
showWeeklyRecipes();