export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <header className="mb-8 border-b border-blood/60 pb-4">
        <h1 className="text-3xl text-bone">小说分镜工坊</h1>
        <p className="mt-2 text-sm text-bone/70">粘贴章节，生成竖屏短剧分镜表</p>
      </header>

      <section id="input" className="rounded-md bg-panel p-4">
        {/* Task 3: 输入区 */}
      </section>

      <section id="shots" className="relative mt-8 border-l-2 border-blood pl-4">
        {/* Task 4: 分镜卡片 */}
      </section>
    </main>
  );
}
