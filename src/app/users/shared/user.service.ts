import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { User, HttpError, FetchUsersError, UsersResponse, Empty } from './user.model';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class UserService {
    /**
     * Exposed observable streams
     */
    users$: Observable<Array<User>>;
    error$: Observable<HttpError | Empty>;
    /**
     * Private producers/observables
     */
    private usersSubject: ReplaySubject<Array<User>>;
    private errorSubject: ReplaySubject<HttpError | Empty>;

    constructor(private http: Http) {
        this.usersSubject = new ReplaySubject<Array<User>>(1);
        this.users$ = this.usersSubject.asObservable();
        this.errorSubject = new ReplaySubject<HttpError | Empty>(1);
        this.error$ = this.errorSubject.asObservable();
    }

    fetchRandomUsers(): void {
        this.http.get('http://randomuser.me/api?results=4')
            .map((res: Response) => res.json())
            .map((res: UsersResponse) => res.results)
            .catch((error: Response) => Observable.throw(
                new FetchUsersError('Users fetch failed: ' + error.text()))
            )
            .subscribe(
                (users: Array<User>) => this.usersSubject.next(users),
                (error: HttpError) => this.errorSubject.next(error)
            );
    }

    /**
     * Force a Http error.
     */
    forceRandomUsersError(): void {
        this.http.get('http://randomuser.me/typo')
            .map((res: Response) => res.json())
            .catch((error: Response) => Observable.throw(
                new FetchUsersError('Users fetch failed: ' + error.text()))
            )
            .subscribe(
                (users: Array<User>) => this.usersSubject.next(users),
                (error: HttpError) => this.errorSubject.next(error)
            );
    }

    clearError(): void {
        this.errorSubject.next(new Empty());
    }
}
