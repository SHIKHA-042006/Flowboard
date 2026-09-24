

import { SquareKanban } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-full bg-white lg:grid-cols-2">

      {/* LEFT SIDE - White Background */}
      <div className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg "style={{ backgroundColor: 'rgb(58, 137, 201)' }}>
              <SquareKanban size={20} />
            </span>

            <span className="text-xl font-bold tracking-tight " style={{ color: 'rgb(58, 137, 201)' }}>
              Flowboard
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'rgb(58, 137, 201)' }}>
            {title}
          </h1>

          <p className="mt-1.5 text-sm text-ink-soft">
            {subtitle}
          </p>

          <div className="mt-7">
            {children}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Image */}
      <div className="hidden bg-white p-5 lg:flex">
        <div className="h-full w-full overflow-hidden rounded-2xl">
          <img
            src="/images/login-image2.png"
            alt="Flowboard"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

    </div>
  );
}




// import { SquareKanban } from 'lucide-react';

// /**
//  * Split layout: the form sits on the left at a comfortable reading width, with
//  * a board-like panel on the right that shows what the product actually is.
//  */
// export default function AuthLayout({ title, subtitle, children }) {
//   return (
//     <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
//       <div className="flex items-center justify-center px-6 py-12">
//         <div className="w-full max-w-sm">
//           <div className="mb-8 flex items-center gap-2">
//             <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-white">
//               <SquareKanban size={20} />
//             </span>
//             <span className="text-xl font-bold tracking-tight">Flowboard</span>
//           </div>

//           <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
//           <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>
//           <div className="mt-7">{children}</div>
//         </div>
//       </div>

//       <div className="relative hidden overflow-hidden bg-board-teal lg:block">
//         <div className="absolute inset-0 flex items-center justify-center p-12">
//           <div className="grid w-full max-w-lg grid-cols-3 gap-3 opacity-95">
//             {[
//               { title: 'Backlog', cards: ['Offline mode', 'Empty states', 'Release notes'] },
//               { title: 'In progress', cards: ['Touch drag and drop', 'Card details panel'] },
//               { title: 'Done', cards: ['CI for the API', 'Type scale'] },
//             ].map((col) => (
//               <div key={col.title} className="rounded-xl2 bg-white/12 p-2.5 backdrop-blur-sm">
//                 <p className="px-1 pb-2 text-[13px] font-bold text-white">{col.title}</p>
//                 <div className="space-y-2">
//                   {col.cards.map((c) => (
//                     <div key={c} className="rounded-lg bg-white/95 px-2.5 py-2 text-[12px] font-medium text-ink shadow-card">
//                       {c}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <p className="absolute bottom-8 left-12 right-12 text-[15px] leading-relaxed text-white/90">
//           Boards your team can edit at the same time. Every move shows up for everyone, instantly.
//         </p>
//       </div>
//     </div>
//   );
// }
