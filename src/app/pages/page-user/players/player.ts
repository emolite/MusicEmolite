import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.html',
})
export class PlayerComponent {
  activeTab: 'lyrics' | 'related' = 'lyrics';
  isPlaying = true;
  currentIndex = 0;

  activeLyricLine = 3;

  lyrics = [
    'Đêm nay trời lạnh hơn bao giờ',
    'Gió thổi mang theo những nỗi nhớ',
    'Em đã đi xa và không trở về',
    'Anh một mình ngồi đếm từng giây',
    'Chờ một giấc mơ mang em về đây',
    'Để anh được nhìn thấy nụ cười',
    'Của người con gái anh yêu mãi mãi',
    'Dù biết rằng mơ chẳng thành thật',
    'Nhưng anh vẫn muốn tin vào điều đó',
    'Rằng có một ngày em sẽ trở lại',
    'Và chúng ta lại cùng nhau bước đi',
    'Trên con đường quen thuộc ngày xưa',
  ];

  queue = [
    { name: 'Chờ Một Giấc Mơ', artist: 'Sơn Tùng M-TP', duration: '3:48' },
    { name: 'Có Chắc Yêu Là Đây', artist: 'Sơn Tùng M-TP', duration: '3:22' },
    { name: 'Người Ta Có Thể', artist: 'Tăng Duy Tân', duration: '4:10' },
    { name: 'Waiting For You', artist: 'MONO', duration: '3:55' },
    { name: 'Ngày Mai Người Ta Lấy Chồng', artist: 'HIEUTHUHAI', duration: '4:30' },
    { name: 'Cô Đơn Trên Sofa', artist: 'Đen Vâu', duration: '3:12' },
    { name: 'Hoa Nở Không Màu', artist: 'Hoài Lâm', duration: '4:05' },
  ];

  relatedSongs = [
    { name: 'Có Chắc Yêu Là Đây', artist: 'Sơn Tùng M-TP', duration: '3:22', color: 'linear-gradient(135deg, #1e3a5f, #0a0a0a)' },
    { name: 'Muộn Rồi Mà Sao Còn', artist: 'Sơn Tùng M-TP', duration: '4:12', color: 'linear-gradient(135deg, #3b1f5e, #0a0a0a)' },
    { name: 'Waiting For You', artist: 'MONO', duration: '3:55', color: 'linear-gradient(135deg, #1a0a2e, #0a0a0a)' },
    { name: 'Người Ta Có Thể', artist: 'Tăng Duy Tân', duration: '4:10', color: 'linear-gradient(135deg, #78350f, #1c0a00)' },
    { name: 'Ngày Mai Người Ta Lấy Chồng', artist: 'HIEUTHUHAI', duration: '4:30', color: 'linear-gradient(135deg, #1e3a5f, #0d0020)' },
    { name: 'Cô Đơn Trên Sofa', artist: 'Đen Vâu', duration: '3:12', color: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)' },
    { name: 'Bước Qua Mùa Cô Đơn', artist: 'Vũ Cát Tường', duration: '3:40', color: 'linear-gradient(135deg, #1a3a1a, #0a0a0a)' },
  ];
}