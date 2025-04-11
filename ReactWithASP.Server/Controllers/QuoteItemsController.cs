using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactWithASP.Server.Models;

namespace ReactWithASP.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuoteItemsController : ControllerBase
    {
        private readonly QuoteContext _context;

        public QuoteItemsController(QuoteContext context)
        {
            _context = context;
        }

        // GET: api/QuoteItems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuoteItem>>> GetQuoteItems()
        {
            return await _context.QuoteItems.ToListAsync();
        }

        // GET: api/QuoteItems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<QuoteItem>> GetQuoteItem(long id)
        {
            var quoteItem = await _context.QuoteItems.FindAsync(id);

            if (quoteItem == null)
            {
                return NotFound();
            }

            return quoteItem;
        }

        // PUT: api/QuoteItems/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutQuoteItem(long id, QuoteItem quoteItem)
        {
            if (id != quoteItem.Id)
            {
                return BadRequest();
            }

            _context.Entry(quoteItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuoteItemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/QuoteItems
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<QuoteItem>> PostQuoteItem(QuoteItem quoteItem)
        {
            _context.QuoteItems.Add(quoteItem);
            await _context.SaveChangesAsync();

            // return CreatedAtAction("GetQuoteItem", new { id = quoteItem.Id }, quoteItem);
            return CreatedAtAction(nameof(GetQuoteItem), new { id = quoteItem.Id }, quoteItem);
        }

        // DELETE: api/QuoteItems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuoteItem(long id)
        {
            var quoteItem = await _context.QuoteItems.FindAsync(id);
            if (quoteItem == null)
            {
                return NotFound();
            }

            _context.QuoteItems.Remove(quoteItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool QuoteItemExists(long id)
        {
            return _context.QuoteItems.Any(e => e.Id == id);
        }
    }
}
