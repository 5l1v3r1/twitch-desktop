import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { concat as _concat } from 'lodash';

import { ErrorService } from '../../providers/errorhandler.service';
import { GameService } from '../../providers/games.service';
import { SpinnerService } from '../../providers/spinner.service';
import { ToolbarService } from '../../providers/toolbar.service';
import { TwitchService } from '../../providers/twitch.service';

@Component({
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit {
  games = [];
  fetchingMore = false;

  constructor(
    private router: Router,
    private toolbarService: ToolbarService,
    private spinnerService: SpinnerService,
    private errorService: ErrorService,
    private gameService: GameService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.spinnerService.show();

    // Set toolbar tile and logo
    this.toolbarService.setTitle('Top Games');
    this.toolbarService.setLogo('games');

    // Load the list of top games and hide the spinner
    this.gameService
      .getTopGames()
      .then((games: any) => {
        this.games = _concat(this.games, games);
        this.spinnerService.hide();
      })
      .catch(reason => {
        this.spinnerService.hide();
        this.errorService.showError('Failed fetching games', reason);
        console.log(reason);
      });
  }

  // Triggered when list is scrolled to bottom (ininite-scroll)
  onScrolled() {
    // Only fetch more if we are not already doing that
    if (!this.fetchingMore) {
      this.fetchingMore = true;
      this.zone.run(() => {});

      this.gameService
        .fetchMoreTopGames()
        .then((games: any) => {
          this.games = games;
          this.fetchingMore = false;
          this.zone.run(() => {});
        })
        .catch(reason => {
          console.log(reason);
          this.fetchingMore = false;
          this.zone.run(() => {});
        });
    }
  }
}
