
Create table USERS(
UID VARCHAR(20) UNIQUE NOT NULL,
Email varchar(20) not null,
Pssd varchar(20) not null,
PRIMARY KEY(UID)
);
ALTER TABLE USERS MODIFY COLUMN Pssd VARCHAR(100) NOT NULL;

CREATE TABLE Viewing_Time_Data (
    id INT NOT NULL AUTO_INCREMENT,
    Site_Name VARCHAR(50) NOT NULL,
    Time_Spend INT(10) NOT NULL,
    datee date,
    user_id VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES USERS(UID)
);


create table Restricted2( id INT not null auto_increment primary key, user_id varchar(100) not null, Res_Site varchar(30) not null, Allowed_Time int(10) not null, foreign key(user_id) REFERENCES USERS(UID));
ALTER TABLE Restricted MODIFY COLUMN user_id VARCHAR(100) NOT NULL;
select * from USERS;
update viewing_time_data set Time_Spend=10 where user_id="d5d446dcfb73470895ec" and datee="2024-05-19" and Site_Name="www.iplt20.com";

DELETE FROM Viewing_Time_Data
WHERE id NOT IN (
    SELECT id FROM (
        SELECT MIN(id) AS id
        FROM Viewing_Time_Data
        WHERE user_id = 'd5d446dcfb73470895ec'
        AND datee = '2024-05-19'
        AND Site_Name = 'www.iplt20.com'
    ) AS subquery
);

select * from viewing_time_data;

SELECT Site_Name, Time_Spend as total_time FROM Viewing_Time_Data WHERE user_id="d5d446dcfb73470895ec"  AND datee ="2024-05-19";

select * from viewing_time_data where datee="2024-05-19";
delete from viewing_time_data where datee="2024-05-19";
alter table restricted2 MODIFY COLUMN Res_Site Varchar(100) not null;
select * from viewing_time_data;
insert into restricted2 values (3,"d5d446dcfb73470895ec","temp-mail.org" , 0);
set global max_allowed_packet=67108864;
