import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from './shared/user.service';
import { User, HttpError, FetchUsersError, Empty } from './shared/user.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'eh-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription;

    constructor(private router: Router, private userService: UserService) {
        this.subscriptions = new Subscription();
    }

    ngOnInit(): void {
        /**
         * Subscribe to users && subscribe to cleared errors -> navigate to the list component
         */
        const userSubscription = this.userService.users$
            .merge(
                this.userService.error$
                    .filter((error: HttpError) => error instanceof Empty)
            )
            .subscribe(
                (users: Array<User>) => this.router.navigate(['users', 'list'])
            );

        /**
         * Subscribe to Http errors -> navigate to the error component
         */
        const errorSubscription = this.userService.error$
            .filter((error: HttpError) => error instanceof HttpError)
            .subscribe(
                () => this.router.navigate(['users', 'error'])
            );

        /**
         * Subscribe to fetch users error -> log a message
         */
        const fetchErrorSubscription = this.userService.error$
            .filter((error: HttpError) => error instanceof FetchUsersError)
            .subscribe(
                () => console.error('Users fetch failed!')
            );
        /**
         * Combine all subscriptions
         */
        this.subscriptions.add(userSubscription);
        this.subscriptions.add(errorSubscription);
        this.subscriptions.add(fetchErrorSubscription);
    }

    ngOnDestroy(): void {
        /**
         * Prevent memory leak by unsubscribing all hot streams.
         */
        this.subscriptions.unsubscribe();
    }

    fetch(): void {
        this.userService.fetchRandomUsers();
    }

    fetchError(): void {
        this.userService.forceRandomUsersError();
    }
}
