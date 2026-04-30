import fetch from "node-fetch";

const books = [
  {
    title: "Livro 01 do Ensino Fundamental Anos Iniciais",
    author: "Josi Neide Gomes Barros",
    genre: "Educação Musical",
    publication_year: 2024,
    condition_status: "Em Produção",
    tags: ["Educação Musical", "Anos Iniciais"],
    stages: {
      "Manuscrito": { responsible: "Josi", status: "Em Andamento" },
      "Projeto Gráfico": { responsible: "Luana" },
      "Diagramação": { responsible: "Furmiga" }
    }
  },
  {
    title: "Livro 02 do Ensino Fundamental Anos Iniciais",
    author: "Josi Neide Gomes Barros",
    genre: "Educação Musical",
    publication_year: 2024,
    condition_status: "Em Produção",
    tags: ["Educação Musical", "Anos Iniciais"],
    stages: {
      "Manuscrito": { responsible: "Neide", start_date: "2024-06-01", end_date: "2024-07-18", status: "Concluído" },
      "Projeto Gráfico": { responsible: "Luana" },
      "Diagramação": { responsible: "Furmiga" },
      "Ilustrações": { responsible: "Canton", start_date: "2024-07-23", end_date: "2024-08-15", status: "Concluído" }
    }
  },
  {
    title: "Livro 03 do Ensino Fundamental Anos Iniciais",
    author: "Josi Neide Gomes Barros",
    genre: "Educação Musical",
    publication_year: 2024,
    condition_status: "Em Produção",
    tags: ["Educação Musical", "Anos Iniciais"],
    stages: {
      "Manuscrito": { responsible: "Neide", start_date: "2024-06-01", end_date: "2024-07-18", status: "Concluído" },
      "Projeto Gráfico": { responsible: "Luana" },
      "Diagramação": { responsible: "Furmiga" },
      "Ilustrações": { responsible: "Canton", start_date: "2024-08-16", end_date: "2024-08-30", status: "Concluído" }
    }
  },
  {
    title: "Livro 04 do Ensino Fundamental Anos Iniciais",
    author: "Josi Neide Gomes Barros",
    genre: "Educação Musical",
    publication_year: 2024,
    condition_status: "Em Planejamento",
    tags: ["Educação Musical", "Anos Iniciais"],
    stages: {
      "Manuscrito": { responsible: "Neide", start_date: "2024-06-01", end_date: "2024-07-18", status: "Concluído" },
      "Projeto Gráfico": { responsible: "Luana" },
      "Diagramação": { responsible: "Furmiga" },
      "Ilustrações": { responsible: "Canton", start_date: "2024-09-01", end_date: "2024-09-15" }
    }
  },
  {
    title: "Livro 05 do Ensino Fundamental Anos Iniciais",
    author: "Josi Neide Gomes Barros",
    genre: "Educação Musical",
    publication_year: 2024,
    condition_status: "Em Planejamento",
    tags: ["Educação Musical", "Anos Iniciais"],
    stages: {
      "Manuscrito": { responsible: "Neide", start_date: "2024-06-01", end_date: "2024-07-18", status: "Concluído" },
      "Projeto Gráfico": { responsible: "Luana" },
      "Diagramação": { responsible: "Furmiga" },
      "Ilustrações": { responsible: "Canton", start_date: "2024-09-16", end_date: "2024-09-30" }
    }
  }
];

async function seed() {
  for (const book of books) {
    console.log(`Adding ${book.title}...`);
    // Create Book
    const createRes = await fetch('http://localhost:3000/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: book.title,
        author: book.author,
        genre: book.genre,
        publication_year: book.publication_year,
        condition_status: book.condition_status,
        tags: book.tags
      })
    });
    const createdBook = await createRes.json();
    const bookId = createdBook.id;

    // Fetch its detailed stages
    const detailRes = await fetch(`http://localhost:3000/api/books/${bookId}`);
    const details = await detailRes.json();
    
    // Update stages
    for (const stageData of details.stages) {
      const updates = book.stages[stageData.stage_name];
      if (updates) {
        await fetch(`http://localhost:3000/api/stages/${stageData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...stageData,
            ...updates
          })
        });
      }
    }
    console.log(`Finished ${book.title}`);
  }
  console.log("Done seeding!");
}

seed().catch(console.error);
