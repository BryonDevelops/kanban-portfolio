

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4 py-12">
      <section className="max-w-2xl w-full text-center flex flex-col items-center gap-8">
        {/*
        <Image
          src="https://placehold.co/400x400/png"
          alt="Portfolio Hero"
          width={160}
          height={160}
          className="mb-4 rounded-full object-cover drop-shadow-xl"
          priority
        />
        */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
          Welcome to My Portfolio
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-xl mx-auto">
          I build modern web applications with Next.js, Supabase, Tailwind CSS, and more. Explore my projects, skills, and experience below.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <a
            href="#projects"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow transition-colors"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-8 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Contact Me
          </a>
        </div>
      </section>
    </main>
  );
}
