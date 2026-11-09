// #174 lightweight markdown: **bold** only, rendered as elements (never as HTML).
export default function RichText({ text }: { text: string }) {
  return text.split('**').map((part, i) => (i % 2 ? <strong key={i /* fixed text: position is the identity */}>{part}</strong> : part));
}
