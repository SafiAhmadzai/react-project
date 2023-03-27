### Sure, here are the steps to create a Dotnet 6 webapi with clean architecture and an example of Todo Product using repository pattern and EntityFramework with SQL Server database:

### Step 1: Create a new Dotnet 6 webapi project using the command line interface (CLI)

### dotnet new webapi -o TodoProduct.API

### Step 2: Create folders for the different layers of clean architecture

    cd TodoProduct.API
    mkdir TodoProduct.Application
    mkdir TodoProduct.Domain
    mkdir TodoProduct.Infrastructure
    Step 3: Create a class library project for the domain layer

### dotnet new classlib -o TodoProduct.Domain

### Step 4: Add the necessary NuGet packages for EntityFramework Core and SQL Server database provider to the infrastructure and application layers

    cd TodoProduct.Infrastructure
    dotnet add package Microsoft.EntityFrameworkCore
    dotnet add package Microsoft.EntityFrameworkCore.SqlServer
    cd ../TodoProduct.Application
    dotnet add package Microsoft.EntityFrameworkCore
    dotnet add package Microsoft.EntityFrameworkCore.SqlServer
    Step 5: Define the Todo Product entity in the domain layer


    namespace TodoProduct.Domain.Entities
    {
        public class TodoProduct
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public bool IsComplete { get; set; }
        }
    }

### Step 6: Create a repository interface in the domain layer

    using System.Collections.Generic;
    using System.Threading.Tasks;
    using TodoProduct.Domain.Entities;

    namespace TodoProduct.Domain.Interfaces
    {
        public interface ITodoProductRepository
        {
            Task<IEnumerable<TodoProduct>> GetAllAsync();
            Task<TodoProduct> GetByIdAsync(int id);
            Task AddAsync(TodoProduct product);
            Task UpdateAsync(TodoProduct product);
            Task DeleteAsync(TodoProduct product);
        }
    }

### Step 7: Implement the repository interface using EntityFramework in the infrastructure layer

    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using TodoProduct.Domain.Entities;
    using TodoProduct.Domain.Interfaces;

    namespace TodoProduct.Infrastructure.Repositories
    {
        public class TodoProductRepository : ITodoProductRepository
        {
            private readonly TodoProductDbContext _dbContext;

            public TodoProductRepository(TodoProductDbContext dbContext)
            {
                _dbContext = dbContext;
            }

            public async Task<IEnumerable<TodoProduct>> GetAllAsync()
            {
                return await _dbContext.TodoProducts.ToListAsync();
            }

            public async Task<TodoProduct> GetByIdAsync(int id)
            {
                return await _dbContext.TodoProducts.FindAsync(id);
            }

            public async Task AddAsync(TodoProduct product)
            {
                await _dbContext.TodoProducts.AddAsync(product);
                await _dbContext.SaveChangesAsync();
            }

            public async Task UpdateAsync(TodoProduct product)
            {
                _dbContext.TodoProducts.Update(product);
                await _dbContext.SaveChangesAsync();
            }

            public async Task DeleteAsync(TodoProduct product)
            {
                _dbContext.TodoProducts.Remove(product);
                await _dbContext.SaveChangesAsync();
            }
        }
    }

### Step 8: Create a DbContext class in the infrastructure layer

    using Microsoft.EntityFrameworkCore;
    using TodoProduct.Domain.Entities;

    namespace TodoProduct.Infrastructure
    {
        public class TodoProductDbContext : DbContext
        {
            public TodoProductDbContext(DbContextOptions<TodoProductDbContext> options) : base(options)
            {
            }

            public DbSet<TodoProduct> TodoProducts { get; set; }
        }
    }

### Step 9: Configure EntityFramework in the Startup.cs file

    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using TodoProduct.Application;
    using TodoProduct.Domain.Interfaces;
    using TodoProduct.Infrastructure;
    using TodoProduct.Infrastructure.Repositories;

    namespace TodoProduct.API
    {
        public class Startup
        {
            public IConfiguration Configuration { get; }

            public Startup(IConfiguration configuration)
            {
                Configuration = configuration;
            }

            public void ConfigureServices(IServiceCollection services)
            {
                services.AddDbContext<TodoProductDbContext>(options =>
                    options.UseSqlServer(Configuration.GetConnectionString("TodoProductDatabase")));

                services.AddScoped<ITodoProductRepository, TodoProductRepository>();
                services.AddApplicationLayer();
                services.AddControllers();
            }

            public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
            {
                if (env.IsDevelopment())
                {
                    app.UseDeveloperExceptionPage();
                }

                app.UseHttpsRedirection();

                app.UseRouting();

                app.UseAuthorization();

                app.UseEndpoints(endpoints =>
                {
                    endpoints.MapControllers();
                });
            }
        }
    }

### Step 10: Add a connection string for the SQL Server database in the appsettings.json file

    {
    "ConnectionStrings": {
        "TodoProductDatabase": "Server=localhost;Database=TodoProductDb;User Id=sa;Password=YourPassword;"
    }
    }

### Step 11: Add a TodoProductController in the API layer

    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using TodoProduct.Application.Services;
    using TodoProduct.Domain.Entities;

    namespace TodoProduct.API.Controllers
    {
        [ApiController]
        [Route("[controller]")]
        public class TodoProductController : ControllerBase
        {
            private readonly ITodoProductService _todoProductService;

            public TodoProductController(ITodoProductService todoProductService)
            {
                _todoProductService = todoProductService;
            }

            [HttpGet]
            public async Task<IEnumerable<TodoProduct>> Get()
            {
                return await _todoProductService.GetAllAsync();
            }

            [HttpGet("{id}")]
            public async Task<TodoProduct> GetById(int id)
            {
                return await _todoProductService.GetByIdAsync(id);
            }

            [HttpPost]
            public async Task<IActionResult> Post([FromBody] TodoProduct product)
            {
                await _todoProductService.AddAsync(product);
                return Ok();
            }

            [HttpPut]
            public async Task<IActionResult> Put([FromBody] TodoProduct product)
            {
                await _todoProductService.UpdateAsync(product);
                return Ok();
            }

            [HttpDelete("{id}")]
            public async Task<IActionResult> Delete(int id)
            {
                var product = await _todoProductService.GetByIdAsync(id);
                await _todoProductService.DeleteAsync(product);
                return Ok();
            }
        }
    }

### Step 12: Add a TodoProductService in the application layer

using System.Collections.Generic;
using System.Threading.Tasks;
using TodoProduct.Domain.Entities;
using TodoProduct.Domain.Interfaces;

namespace TodoProduct.Application.Services
{
public class TodoProductService : ITodoProductService
{
private readonly ITodoProductRepository \_todoProductRepository;

        public TodoProductService(ITodoProductRepository todoProductRepository)
        {
            _todoProductRepository = todoProductRepository;
        }

        public async Task<IEnumerable<TodoProduct>> GetAllAsync()
        {
            return await _todoProductRepository.GetAllAsync();
        }

        public async Task<TodoProduct> GetByIdAsync(int id)
        {
            return await _todoProductRepository.GetByIdAsync(id);

        }

        public async Task AddAsync(TodoProduct product)
        {
            await _todoProductRepository.AddAsync(product);
        }

        public async Task UpdateAsync(TodoProduct product)
        {
            await _todoProductRepository.UpdateAsync(product);
        }

        public async Task DeleteAsync(TodoProduct product)
        {
            await _todoProductRepository.DeleteAsync(product);
        }
    }

}

### Step 13: Add an ITodoProductService interface in the Application layer

    using System.Collections.Generic;
    using System.Threading.Tasks;
    using TodoProduct.Domain.Entities;

    namespace TodoProduct.Application.Services
    {
        public interface ITodoProductService
        {
            Task<IEnumerable<TodoProduct>> GetAllAsync();
            Task<TodoProduct> GetByIdAsync(int id);
            Task AddAsync(TodoProduct product);
            Task UpdateAsync(TodoProduct product);
            Task DeleteAsync(TodoProduct product);
        }
    }

### Step 14: Add a TodoProductRepository in the Infrastructure layer

    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Microsoft.EntityFrameworkCore;
    using TodoProduct.Domain.Entities;
    using TodoProduct.Domain.Interfaces;

    namespace TodoProduct.Infrastructure.Repositories
    {
        public class TodoProductRepository : ITodoProductRepository
        {
            private readonly TodoProductDbContext _dbContext;

            public TodoProductRepository(TodoProductDbContext dbContext)
            {
                _dbContext = dbContext;
            }

            public async Task<IEnumerable<TodoProduct>> GetAllAsync()
            {
                return await _dbContext.TodoProducts.ToListAsync();
            }

            public async Task<TodoProduct> GetByIdAsync(int id)
            {
                return await _dbContext.TodoProducts.FindAsync(id);
            }

            public async Task AddAsync(TodoProduct product)
            {
                await _dbContext.TodoProducts.AddAsync(product);
                await _dbContext.SaveChangesAsync();
            }

            public async Task UpdateAsync(TodoProduct product)
            {
                _dbContext.TodoProducts.Update(product);
                await _dbContext.SaveChangesAsync();
            }

            public async Task DeleteAsync(TodoProduct product)
            {
                _dbContext.TodoProducts.Remove(product);
                await _dbContext.SaveChangesAsync();
            }
        }
    }

### Step 15: Add an ITodoProductRepository interface in the Domain layer

    using System.Collections.Generic;
    using System.Threading.Tasks;

    namespace TodoProduct.Domain.Interfaces
    {
        public interface ITodoProductRepository
        {
            Task<IEnumerable<TodoProduct>> GetAllAsync();
            Task<TodoProduct> GetByIdAsync(int id);
            Task AddAsync(TodoProduct product);
            Task UpdateAsync(TodoProduct product);
            Task DeleteAsync(TodoProduct product);
        }
    }

### With these steps completed, you should now have a functioning API using the Clean Architecture approach with EntityFramework and a SQL Server database. You can test it by running the API and using a tool such as Postman to make requests to the endpoints.
