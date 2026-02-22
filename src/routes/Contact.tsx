export function Contact() {
  return (
    <div className="pt-6">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4 sm:p-6">
          <h1 className="text-xl font-bold">お問い合わせ</h1>
          <div className="mt-3 text-sm leading-relaxed opacity-80 space-y-2">
            <p>ご意見・不具合報告は、下記のXアカウントへご連絡ください。</p>
            <p>
              X (Twitter):{" "}
              <a
                href="https://x.com/ashcolor06"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                @ashcolor06
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
