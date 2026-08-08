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
     * out instead of all riding one flat line.
     */
    readonly notes: Array<{ shape: NoteShape; topOffset: string; flyY: string; size: string; duration: string; delay: string; color: string }> = [
        { shape: 'eighth', topOffset: '-70px', flyY: '-60px', size: '2.2rem', duration: '9s', delay: '0s', color: '#f87171' },
        { shape: 'quarter', topOffset: '-30px', flyY: '40px', size: '1.7rem', duration: '11s', delay: '1.4s', color: '#fb923c' },
        { shape: 'beamed', topOffset: '10px', flyY: '-100px', size: '2.5rem', duration: '8s', delay: '2.8s', color: '#facc15' },
        { shape: 'half', topOffset: '55px', flyY: '70px', size: '1.9rem', duration: '10s', delay: '.6s', color: '#4ade80' },
        { shape: 'eighth', topOffset: '-100px', flyY: '20px', size: '1.6rem', duration: '9.5s', delay: '3.6s', color: '#38bdf8' },
        { shape: 'beamed', topOffset: '90px', flyY: '-50px', size: '2.3rem', duration: '12s', delay: '2s', color: '#818cf8' },
        { shape: 'quarter', topOffset: '-50px', flyY: '90px', size: '2rem', duration: '8.5s', delay: '4.4s', color: '#c084fc' },
        { shape: 'half', topOffset: '30px', flyY: '-20px', size: '1.8rem', duration: '10.5s', delay: '5.2s', color: '#f472b6' }
    ];

    /**
     * Small, dim, static notes scattered across the whole background - the
     * size/blur/opacity spread reads as depth (near vs. far) that the flying
     * notes alone can't provide.
     */
    readonly ambientNotes: Array<{ shape: NoteShape; top: string; left: string; size: string; color: string; blur: string; opacity: number; delay: string }> = [
        { shape: 'eighth', top: '8%', left: '72%', size: '1.1rem', color: '#f87171', blur: '0px', opacity: .5, delay: '0s' },
        { shape: 'quarter', top: '14%', left: '58%', size: '0.7rem', color: '#38bdf8', blur: '1px', opacity: .3, delay: '1.2s' },
        { shape: 'half', top: '22%', left: '85%', size: '0.9rem', color: '#facc15', blur: '.5px', opacity: .4, delay: '2.1s' },
        { shape: 'beamed', top: '38%', left: '5%', size: '0.8rem', color: '#c084fc', blur: '1px', opacity: .35, delay: '0.6s' },
        { shape: 'eighth', top: '58%', left: '90%', size: '1rem', color: '#4ade80', blur: '0px', opacity: .45, delay: '1.8s' },
        { shape: 'quarter', top: '72%', left: '15%', size: '0.7rem', color: '#f472b6', blur: '1.5px', opacity: .3, delay: '2.6s' },
        { shape: 'half', top: '85%', left: '60%', size: '0.9rem', color: '#fb923c', blur: '.5px', opacity: .4, delay: '0.9s' },
        { shape: 'beamed', top: '92%', left: '30%', size: '1.1rem', color: '#818cf8', blur: '0px', opacity: .5, delay: '1.5s' },
        { shape: 'eighth', top: '4%', left: '30%', size: '0.6rem', color: '#f87171', blur: '1.5px', opacity: .25, delay: '2.9s' },
        { shape: 'quarter', top: '65%', left: '45%', size: '0.6rem', color: '#38bdf8', blur: '1.5px', opacity: .25, delay: '0.3s' }
    ];
}
