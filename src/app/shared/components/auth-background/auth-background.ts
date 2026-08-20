import { Component } from '@angular/core';

export type NoteShape = 'eighth' | 'quarter' | 'half' | 'beamed';

@Component({
    selector: 'app-auth-background',
    standalone: true,
    templateUrl: './auth-background.html',
    styleUrl: './auth-background.css'
})
export class AuthBackgroundComponent {

    /** Solid Material-style note icon instead of a Unicode glyph - crisp and bold at any size, unlike ♪/♫ which render as thin, inconsistent hairlines depending on the system font. Kept as one of 4 shapes (see NoteShape) so it's not the same glyph repeated in different colors. */
    readonly noteIconPath = 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z';

    /**
     * Notes spawn at the speaker (.speaker, pinned to the form panel's left
     * edge) and fly left across the background - topOffset staggers where
     * each one starts near the speaker, flyY where it ends up, so they spray
     * out instead of all riding one flat line. Trimmed from 8 to 6: each one
     * is an animating, drop-shadow-filtered SVG, so fewer of them simultaneously
     * is a real cost saving on weak hardware, not just a visual tweak.
     */
    readonly notes: Array<{ shape: NoteShape; topOffset: string; flyY: string; size: string; duration: string; delay: string; color: string }> = [
        { shape: 'eighth', topOffset: '-70px', flyY: '-60px', size: '2.2rem', duration: '9s', delay: '0s', color: '#f87171' },
        { shape: 'quarter', topOffset: '-30px', flyY: '40px', size: '1.7rem', duration: '11s', delay: '1.4s', color: '#fb923c' },
        { shape: 'beamed', topOffset: '10px', flyY: '-100px', size: '2.5rem', duration: '8s', delay: '2.8s', color: '#facc15' },
        { shape: 'half', topOffset: '55px', flyY: '70px', size: '1.9rem', duration: '10s', delay: '.6s', color: '#4ade80' },
        { shape: 'eighth', topOffset: '-100px', flyY: '20px', size: '1.6rem', duration: '9.5s', delay: '3.6s', color: '#38bdf8' },
        { shape: 'beamed', topOffset: '90px', flyY: '-50px', size: '2.3rem', duration: '12s', delay: '2s', color: '#818cf8' }
    ];

    /**
     * Small, dim, static notes scattered across the whole background - the
     * size/opacity spread reads as depth (near vs. far). Trimmed from 10 to
     * 6, and each one no longer carries its own `blur()` filter (see the
     * .ambient-note comment in the CSS) - opacity alone gets most of the
     * same depth read at a fraction of the render cost.
     */
    readonly ambientNotes: Array<{ shape: NoteShape; top: string; left: string; size: string; color: string; opacity: number; delay: string }> = [
        { shape: 'eighth', top: '8%', left: '72%', size: '1.1rem', color: '#f87171', opacity: .5, delay: '0s' },
        { shape: 'quarter', top: '14%', left: '58%', size: '0.7rem', color: '#38bdf8', opacity: .3, delay: '1.2s' },
        { shape: 'half', top: '38%', left: '5%', size: '0.8rem', color: '#c084fc', opacity: .35, delay: '0.6s' },
        { shape: 'beamed', top: '58%', left: '90%', size: '1rem', color: '#4ade80', opacity: .45, delay: '1.8s' },
        { shape: 'eighth', top: '85%', left: '60%', size: '0.9rem', color: '#fb923c', opacity: .4, delay: '0.9s' },
        { shape: 'quarter', top: '92%', left: '30%', size: '1.1rem', color: '#818cf8', opacity: .5, delay: '1.5s' }
    ];
}
