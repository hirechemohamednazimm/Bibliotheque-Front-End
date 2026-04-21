/**
 * Seed script — populate the database with realistic French library data.
 * Run with: node seeders/seed.js
 */

require("dotenv").config();
const bcrypt = require("bcryptjs");
const sequelize = require("../config/db");
const { Role, User, Author, Category, Book, Loan, Review } = require("../models/relation");

async function seed() {
  await sequelize.authenticate();
  console.log("✅ Connexion à la base de données établie");

  // ─── Roles ───────────────────────────────────────────────────────────────────
  const [adminRole] = await Role.findOrCreate({ where: { name: "admin" } });
  const [userRole] = await Role.findOrCreate({ where: { name: "user" } });
  console.log("✅ Rôles créés");

  // ─── Categories ───────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    Category.findOrCreate({ where: { name: "Roman" } }),
    Category.findOrCreate({ where: { name: "Philosophie" } }),
    Category.findOrCreate({ where: { name: "Science-fiction" } }),
    Category.findOrCreate({ where: { name: "Policier" } }),
    Category.findOrCreate({ where: { name: "Histoire" } }),
    Category.findOrCreate({ where: { name: "Biographie" } }),
    Category.findOrCreate({ where: { name: "Poésie" } }),
    Category.findOrCreate({ where: { name: "Jeunesse" } }),
  ]);
  const [roman, philo, scifi, policier, histoire, bio, poesie, jeunesse] =
    categories.map(([c]) => c);
  console.log("✅ Catégories créées");

  // ─── Authors ───────────────────────────────────────────────────────────────
  // Photos : domaine public via Wikimedia Commons
  const authorData = [
    { name: "Victor Hugo", bio: "Écrivain français du XIXe siècle, auteur des Misérables et Notre-Dame de Paris.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Victor_Hugo_by_Étienne_Carjat_1876_-_full.jpg/400px-Victor_Hugo_by_Étienne_Carjat_1876_-_full.jpg" },
    { name: "Albert Camus", bio: "Philosophe et romancier français, prix Nobel de littérature 1957.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Albert_Camus%2C_gagnant_de_prix_Nobel%2C_portrait_en_buste%2C_pos%C3%A9_au_bureau%2C_faisant_face_%C3%A0_gauche%2C_cigarette_de_tabagisme.jpg/400px-Albert_Camus%2C_gagnant_de_prix_Nobel%2C_portrait_en_buste%2C_pos%C3%A9_au_bureau%2C_faisant_face_%C3%A0_gauche%2C_cigarette_de_tabagisme.jpg" },
    { name: "Simone de Beauvoir", bio: "Philosophe et romancière française, figure majeure du féminisme.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Simone_de_Beauvoir.jpg/400px-Simone_de_Beauvoir.jpg" },
    { name: "Marcel Proust", bio: "Romancier français, auteur de À la recherche du temps perdu.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Marcel_Proust_1895.jpg/400px-Marcel_Proust_1895.jpg" },
    { name: "Gustave Flaubert", bio: "Romancier français du XIXe siècle, auteur de Madame Bovary.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Gustave_flaubert.jpg/400px-Gustave_flaubert.jpg" },
    { name: "Émile Zola", bio: "Romancier français, chef de file du naturalisme.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Emile_Zola_1902.jpg/400px-Emile_Zola_1902.jpg" },
    { name: "Voltaire", bio: "Philosophe et écrivain français des Lumières.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Nicolas_de_Largilli%C3%A8re%2C_Voltaire%2C_1718_%28revised%29.jpg/400px-Nicolas_de_Largilli%C3%A8re%2C_Voltaire%2C_1718_%28revised%29.jpg" },
    { name: "Jean-Paul Sartre", bio: "Philosophe existentialiste et romancier français.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Jean-Paul_Sartre_FP.jpg/400px-Jean-Paul_Sartre_FP.jpg" },
    { name: "George Orwell", bio: "Romancier britannique, auteur de 1984 et La Ferme des animaux.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/George_Orwell_press_photo.jpg/400px-George_Orwell_press_photo.jpg" },
    { name: "Jules Verne", bio: "Romancier français, pionnier de la science-fiction.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Jules_Verne_by_Nadar.jpg/400px-Jules_Verne_by_Nadar.jpg" },
    { name: "Stendhal", bio: "Romancier français du XIXe siècle, auteur du Rouge et le Noir.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Stendhal.jpg/400px-Stendhal.jpg" },
    { name: "Alexandre Dumas", bio: "Romancier français, auteur des Trois Mousquetaires et du Comte de Monte-Cristo.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Alexandre_Dumas_p%C3%A8re.jpg/400px-Alexandre_Dumas_p%C3%A8re.jpg" },
    { name: "Honoré de Balzac", bio: "Romancier français, auteur de La Comédie humaine.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Honor%C3%A9_de_Balzac_%281842%29_life_mask_by_David_d%27Angers.jpg/400px-Honor%C3%A9_de_Balzac_%281842%29_life_mask_by_David_d%27Angers.jpg" },
    { name: "Arthur Rimbaud", bio: "Poète français du XIXe siècle, auteur d'Une saison en enfer.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Rimbaud.jpg/400px-Rimbaud.jpg" },
  ];

  const authors = {};
  for (const a of authorData) {
    const [author] = await Author.findOrCreate({
      where: { name: a.name },
      defaults: { bio: a.bio, image: a.image },
    });
    // Mettre à jour l'image si elle manque
    if (!author.image && a.image) await author.update({ image: a.image });
    authors[a.name] = author;
  }
  console.log("✅ Auteurs créés");

  // ─── Books ─────────────────────────────────────────────────────────────────
  // Couvertures : Open Library Covers (domaine public / libre de droits)
  // Format : https://covers.openlibrary.org/b/isbn/ISBN-L.jpg
  const bookData = [
    { title: "Les Misérables", isbn: "9782070409228", authorKey: "Victor Hugo", categoryId: roman.id, publishedYear: 1862, image: "https://covers.openlibrary.org/b/isbn/9782070409228-L.jpg" },
    { title: "Notre-Dame de Paris", isbn: "9782070408986", authorKey: "Victor Hugo", categoryId: roman.id, publishedYear: 1831, image: "https://covers.openlibrary.org/b/isbn/9782070408986-L.jpg" },
    { title: "L'Étranger", isbn: "9782070360024", authorKey: "Albert Camus", categoryId: roman.id, publishedYear: 1942, image: "https://covers.openlibrary.org/b/isbn/9782070360024-L.jpg" },
    { title: "La Peste", isbn: "9782070360413", authorKey: "Albert Camus", categoryId: roman.id, publishedYear: 1947, image: "https://covers.openlibrary.org/b/isbn/9782070360413-L.jpg" },
    { title: "Le Deuxième Sexe", isbn: "9782070205134", authorKey: "Simone de Beauvoir", categoryId: philo.id, publishedYear: 1949, image: "https://covers.openlibrary.org/b/isbn/9782070205134-L.jpg" },
    { title: "Du côté de chez Swann", isbn: "9782070408504", authorKey: "Marcel Proust", categoryId: roman.id, publishedYear: 1913, image: "https://covers.openlibrary.org/b/isbn/9782070408504-L.jpg" },
    { title: "Madame Bovary", isbn: "9782070360727", authorKey: "Gustave Flaubert", categoryId: roman.id, publishedYear: 1857, image: "https://covers.openlibrary.org/b/isbn/9782070360727-L.jpg" },
    { title: "Germinal", isbn: "9782070408597", authorKey: "Émile Zola", categoryId: roman.id, publishedYear: 1885, image: "https://covers.openlibrary.org/b/isbn/9782070408597-L.jpg" },
    { title: "L'Assommoir", isbn: "9782070408719", authorKey: "Émile Zola", categoryId: roman.id, publishedYear: 1877, image: "https://covers.openlibrary.org/b/isbn/9782070408719-L.jpg" },
    { title: "Candide", isbn: "9782070408671", authorKey: "Voltaire", categoryId: philo.id, publishedYear: 1759, image: "https://covers.openlibrary.org/b/isbn/9782070408671-L.jpg" },
    { title: "La Nausée", isbn: "9782070208099", authorKey: "Jean-Paul Sartre", categoryId: philo.id, publishedYear: 1938, image: "https://covers.openlibrary.org/b/isbn/9782070208099-L.jpg" },
    { title: "1984", isbn: "9780451524935", authorKey: "George Orwell", categoryId: scifi.id, publishedYear: 1949, image: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg" },
    { title: "La Ferme des animaux", isbn: "9782070362226", authorKey: "George Orwell", categoryId: roman.id, publishedYear: 1945, image: "https://covers.openlibrary.org/b/isbn/9782070362226-L.jpg" },
    { title: "Vingt Mille Lieues sous les mers", isbn: "9782070408139", authorKey: "Jules Verne", categoryId: scifi.id, publishedYear: 1870, image: "https://covers.openlibrary.org/b/isbn/9782070408139-L.jpg" },
    { title: "Le Tour du monde en 80 jours", isbn: "9782070409334", authorKey: "Jules Verne", categoryId: scifi.id, publishedYear: 1872, image: "https://covers.openlibrary.org/b/isbn/9782070409334-L.jpg" },
    { title: "Le Rouge et le Noir", isbn: "9782070408856", authorKey: "Stendhal", categoryId: roman.id, publishedYear: 1830, image: "https://covers.openlibrary.org/b/isbn/9782070408856-L.jpg" },
    { title: "Les Trois Mousquetaires", isbn: "9782070408238", authorKey: "Alexandre Dumas", categoryId: roman.id, publishedYear: 1844, image: "https://covers.openlibrary.org/b/isbn/9782070408238-L.jpg" },
    { title: "Le Comte de Monte-Cristo", isbn: "9782070409099", authorKey: "Alexandre Dumas", categoryId: roman.id, publishedYear: 1844, image: "https://covers.openlibrary.org/b/isbn/9782070409099-L.jpg" },
    { title: "Le Père Goriot", isbn: "9782070409371", authorKey: "Honoré de Balzac", categoryId: roman.id, publishedYear: 1835, image: "https://covers.openlibrary.org/b/isbn/9782070409371-L.jpg" },
    { title: "Une saison en enfer", isbn: "9782070408459", authorKey: "Arthur Rimbaud", categoryId: poesie.id, publishedYear: 1873, image: "https://covers.openlibrary.org/b/isbn/9782070408459-L.jpg" },
  ];

  const books = [];
  for (const b of bookData) {
    const [book] = await Book.findOrCreate({
      where: { isbn: b.isbn },
      defaults: {
        title: b.title,
        authorId: authors[b.authorKey].id,
        categoryId: b.categoryId,
        publishedYear: b.publishedYear,
        image: b.image,
      },
    });
    if (!book.image && b.image) await book.update({ image: b.image });
    books.push(book);
  }
  console.log("✅ Livres créés");

  // ─── Users ─────────────────────────────────────────────────────────────────
  const hash = async (pw) => bcrypt.hash(pw, 10);

  const userData = [
    { fullname: "Administrateur", email: "admin@bibliotheque.ca", password: await hash("Admin1234!"), roleId: adminRole.id },
    { fullname: "Sophie Martin", email: "sophie.martin@email.com", password: await hash("User1234!"), roleId: userRole.id },
    { fullname: "Lucas Bernard", email: "lucas.bernard@email.com", password: await hash("User1234!"), roleId: userRole.id },
    { fullname: "Emma Dupont", email: "emma.dupont@email.com", password: await hash("User1234!"), roleId: userRole.id },
    { fullname: "Théo Moreau", email: "theo.moreau@email.com", password: await hash("User1234!"), roleId: userRole.id },
    { fullname: "Chloé Leroy", email: "chloe.leroy@email.com", password: await hash("User1234!"), roleId: userRole.id },
    { fullname: "Nathan Simon", email: "nathan.simon@email.com", password: await hash("User1234!"), roleId: userRole.id },
    { fullname: "Léa Laurent", email: "lea.laurent@email.com", password: await hash("User1234!"), roleId: userRole.id },
    { fullname: "Hugo Michel", email: "hugo.michel@email.com", password: await hash("User1234!"), roleId: userRole.id },
    { fullname: "Inès Garcia", email: "ines.garcia@email.com", password: await hash("User1234!"), roleId: userRole.id },
    { fullname: "Tom Roux", email: "tom.roux@email.com", password: await hash("User1234!"), roleId: userRole.id },
    { fullname: "Manon Faure", email: "manon.faure@email.com", password: await hash("User1234!"), roleId: userRole.id },
    { fullname: "Raphaël Girard", email: "raphael.girard@email.com", password: await hash("User1234!"), roleId: userRole.id },
    { fullname: "Camille Bonnet", email: "camille.bonnet@email.com", password: await hash("User1234!"), roleId: userRole.id },
    { fullname: "Alexis Petit", email: "alexis.petit@email.com", password: await hash("User1234!"), roleId: userRole.id },
  ];

  const users = [];
  for (const u of userData) {
    const [user] = await User.findOrCreate({
      where: { email: u.email },
      defaults: { fullname: u.fullname, password: u.password, roleId: u.roleId },
    });
    users.push(user);
  }
  console.log("✅ Utilisateurs créés");

  // ─── Loans ─────────────────────────────────────────────────────────────────
  const today = new Date();
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
  };
  const daysFromNow = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
  };

  const loansData = [
    { userId: users[1].id, bookId: books[0].id, loanDate: daysAgo(20), returnDate: daysAgo(6), status: "returned" },
    { userId: users[2].id, bookId: books[2].id, loanDate: daysAgo(10), returnDate: daysFromNow(4), status: "borrowed" },
    { userId: users[3].id, bookId: books[4].id, loanDate: daysAgo(5), returnDate: daysFromNow(9), status: "borrowed" },
    { userId: users[4].id, bookId: books[6].id, loanDate: daysAgo(30), returnDate: daysAgo(16), status: "returned" },
    { userId: users[5].id, bookId: books[11].id, loanDate: daysAgo(3), returnDate: daysFromNow(11), status: "borrowed" },
    { userId: users[6].id, bookId: books[1].id, loanDate: daysAgo(15), returnDate: daysAgo(1), status: "returned" },
    { userId: users[7].id, bookId: books[8].id, loanDate: daysAgo(8), returnDate: daysFromNow(6), status: "borrowed" },
    { userId: users[8].id, bookId: books[15].id, loanDate: daysAgo(25), returnDate: daysAgo(11), status: "returned" },
    { userId: users[9].id, bookId: books[16].id, loanDate: daysAgo(2), returnDate: daysFromNow(12), status: "borrowed" },
    { userId: users[10].id, bookId: books[9].id, loanDate: daysAgo(40), returnDate: daysAgo(26), status: "returned" },
    { userId: users[11].id, bookId: books[13].id, loanDate: daysAgo(7), returnDate: daysFromNow(7), status: "borrowed" },
    { userId: users[12].id, bookId: books[17].id, loanDate: daysAgo(12), returnDate: daysFromNow(2), status: "borrowed" },
    { userId: users[13].id, bookId: books[5].id, loanDate: daysAgo(18), returnDate: daysAgo(4), status: "returned" },
    { userId: users[14].id, bookId: books[10].id, loanDate: daysAgo(1), returnDate: daysFromNow(13), status: "borrowed" },
  ];

  for (const l of loansData) {
    await Loan.findOrCreate({
      where: { userId: l.userId, bookId: l.bookId, loanDate: l.loanDate },
      defaults: { returnDate: l.returnDate, status: l.status },
    });
  }
  console.log("✅ Emprunts créés");

  // ─── Reviews ───────────────────────────────────────────────────────────────
  const reviewsData = [
    { userId: users[1].id, bookId: books[0].id, rating: 5, comment: "Un chef-d'œuvre absolu. Victor Hugo à son meilleur, une lecture incontournable." },
    { userId: users[2].id, bookId: books[2].id, rating: 4, comment: "L'Étranger est un roman court mais d'une profondeur remarquable. Camus sait toucher juste." },
    { userId: users[3].id, bookId: books[11].id, rating: 5, comment: "1984 est visionnaire. Un roman qui fait réfléchir sur notre société actuelle." },
    { userId: users[4].id, bookId: books[6].id, rating: 4, comment: "Madame Bovary est un portrait magistral de la bourgeoisie provinciale du XIXe siècle." },
    { userId: users[5].id, bookId: books[4].id, rating: 3, comment: "Intéressant mais parfois difficile d'accès. Une lecture importante pour comprendre le féminisme." },
    { userId: users[6].id, bookId: books[1].id, rating: 5, comment: "Notre-Dame de Paris est une fresque historique époustouflante. La description de la cathédrale est sublime." },
    { userId: users[7].id, bookId: books[16].id, rating: 4, comment: "Les Trois Mousquetaires est un roman d'aventures palpitant. Athos, Porthos, Aramis et d'Artagnan sont inoubliables." },
    { userId: users[8].id, bookId: books[15].id, rating: 4, comment: "Le Rouge et le Noir est un roman psychologique fascinant. Julien Sorel est un personnage complexe." },
    { userId: users[9].id, bookId: books[9].id, rating: 5, comment: "Candide est un conte philosophique brillant. Voltaire se moque avec génie de l'optimisme naïf." },
    { userId: users[10].id, bookId: books[13].id, rating: 5, comment: "Jules Verne nous transporte dans les profondeurs des océans avec une imagination débordante !" },
    { userId: users[11].id, bookId: books[3].id, rating: 4, comment: "La Peste est une métaphore puissante sur la condition humaine face à l'adversité." },
    { userId: users[12].id, bookId: books[17].id, rating: 5, comment: "Le Comte de Monte-Cristo est une saga épique. La vengeance d'Edmond Dantès est captivante du début à la fin." },
  ];

  for (const r of reviewsData) {
    await Review.findOrCreate({
      where: { userId: r.userId, bookId: r.bookId },
      defaults: { rating: r.rating, comment: r.comment },
    });
  }
  console.log("✅ Avis créés");

  console.log("\n🎉 Base de données peuplée avec succès !");
  console.log("─────────────────────────────────────────");
  console.log("  Admin : admin@bibliotheque.ca / Admin1234!");
  console.log("  User  : sophie.martin@email.com / User1234!");
  console.log("─────────────────────────────────────────");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Erreur lors du seed :", err);
  process.exit(1);
});
