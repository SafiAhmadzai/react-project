## Create a new project in Visual Studio using the .NET 6 Web API template.

### Add a new folder called "Models" to the project. In this folder, create a new class called "Item" with the following properties:

    public class Item
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        }

### Add a new folder called "Services" to the project. In this folder, create a new class called "ItemService" with the following methods:

    public class ItemService
    {
        private readonly AppDbContext _dbContext;

        public ItemService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<Item>> GetItemsAsync()
        {
            return await _dbContext.Items.ToListAsync();
        }

        public async Task<Item> GetItemByIdAsync(int id)
        {
            return await _dbContext.Items.FindAsync(id);
        }

        public async Task<int> CreateItemAsync(Item item)
        {
            _dbContext.Items.Add(item);
            await _dbContext.SaveChangesAsync();

            return item.Id;
        }

        public async Task<bool> UpdateItemAsync(int id, Item item)
        {
            var existingItem = await _dbContext.Items.FindAsync(id);

            if (existingItem == null)
            {
                return false;
            }

            existingItem.Name = item.Name;
            existingItem.Description = item.Description;

            await _dbContext.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteItemAsync(int id)
        {
            var existingItem = await _dbContext.Items.FindAsync(id);

            if (existingItem == null)
            {
                return false;
            }

            _dbContext.Items.Remove(existingItem);
            await _dbContext.SaveChangesAsync();

            return true;
        }
    }

### Add a new folder called "Data" to the project. In this folder, create a new class called "AppDbContext" with the following code:

    public class AppDbContext : DbContext
    {
        public DbSet<Item> Items { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
    }

### In the "Startup.cs" file, add the following code in the "ConfigureServices" method to register the database context and the item service:

    services.AddDbContext<AppDbContext>(options =>
    {
        options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));
    });

    services.AddScoped<ItemService>();

### In the "Controllers" folder, add a new class called "ItemsController" with the following code:

    [ApiController]
    [Route("[controller]")]
    public class ItemsController : ControllerBase
    {
        private readonly ItemService _itemService;

        public ItemsController(ItemService itemService)
        {
            _itemService = itemService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Item>>> GetItems()
        {
            var items = await _itemService.GetItemsAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Item>> GetItem(int id)
        {
            var item = await _itemService.GetItemByIdAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<int>> CreateItem(Item item)
        {
            var id = await _itemService.CreateItemAsync(item);
            return Ok(id);
        }


        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateItem(int id, Item item)
        {
            var result = await _itemService.UpdateItemAsync(id, item);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteItem(int id)
        {
            var result = await _itemService.DeleteItemAsync(id);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }
    }

### Finally, add the following code to the "appsettings.json" file to define the connection string to the SQL Server database:

    "ConnectionStrings": {
        "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MyDb;Trusted_Connection=True;"
    }

### This code sets up a simple web API with CRUD operations using Entity Framework for database access. Of course, you can customize it further to meet your specific requirements and best practices for enterprise-level APIs, such as adding authentication, logging, error handling, input validation, and performance optimization.

## ---------------

### To add a relation between the Item model and another model, you can modify the Item model to include a foreign key property that references the related model, and then update the AppDbContext class to define the relationship between the two models. Here's an example of how to add a relation between the Item and Category models:

### Add a new model called "Category" in the "Models" folder with the following code:

    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public ICollection<Item> Items { get; set; }
    }

### Modify the Item model to include a foreign key property that references the Category model:

    public class Item
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public int CategoryId { get; set; }
        public Category Category { get; set; }
    }

### In this code, the "CategoryId" property represents the foreign key, and the "Category" property represents the navigation property that allows you to access the related Category object. Update the AppDbContext class to define the relationship between the Item and Category models:

    public class AppDbContext : DbContext
    {
        public DbSet<Item> Items { get; set; }
        public DbSet<Category> Categories { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Item>()
                .HasOne(i => i.Category)
                .WithMany(c => c.Items)
                .HasForeignKey(i => i.CategoryId);
        }
    }

### In this code, the "OnModelCreating" method defines the relationship between the Item and Category models. It specifies that an Item can have one Category, and a Category can have many Items. It also specifies that the "CategoryId" property in the Item model should be used as the foreign key to the Category model.

### With these changes, you can now create, read, update, and delete Items with a reference to a Category. For example, to create an Item with a reference to a Category, you can modify the CreateItem method in the ItemService class as follows:

    public async Task<int> CreateItemAsync(Item item)
    {
        _dbContext.Items.Add(item);
        await _dbContext.SaveChangesAsync();

        return item.Id;
    }


    public async Task<int> CreateItemAsync(Item item, int categoryId)
    {
        var category = await _dbContext.Categories.FindAsync(categoryId);
        if (category == null)
        {
            throw new Exception($"Category with id {categoryId} not found.");
        }

        item.Category = category;
        _dbContext.Items.Add(item);
        await _dbContext.SaveChangesAsync();

        return item.Id;
    }

### Note that in this modified version of the method, it retrieves the Category object from the database using the specified "categoryId", and then sets the Item's Category property to the retrieved object before saving the changes to the database.

### You can also modify the other methods in the ItemService class to handle the relation appropriately, depending on your specific requirements.
